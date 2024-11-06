import express from "express";
const app = express();
const port = 443;
const emailRoute = require("./routes/email");
const packageRoute = require("./routes/packageRoute");
const https = require("https");
const fsFile = require("fs");
const cors = require("cors");

const fs = require("fs").promises;
const path = require("path");

const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const jsdom = require("jsdom");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

const cron = require("node-cron");

const simpleParser = require("mailparser").simpleParser;

const {
	createEmail,
	getEmails,
	updateEmail,
	deleteEmail,
} = require("./models/email");

const {
	createPackage,
	getPackages,
	upsertPackage,
	updatePackage,
	deletePackage,
} = require("./models/packageModel");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
	try {
		const content = await fs.readFile(TOKEN_PATH);
		const credentials = JSON.parse(content);
		return google.auth.fromJSON(credentials);
	} catch (err) {
		return null;
	}
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
	const content = await fs.readFile(CREDENTIALS_PATH);
	const keys = JSON.parse(content);
	const key = keys.installed || keys.web;
	const payload = JSON.stringify({
		type: "authorized_user",
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	});
	await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
	let client = await loadSavedCredentialsIfExist();
	if (client) {
		return client;
	}
	client = await authenticate({
		scopes: SCOPES,
		keyfilePath: CREDENTIALS_PATH,
	});
	if (client.credentials) {
		await saveCredentials(client);
	}
	return client;
}

/**
 * Watch the gmail account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function watchEmail(auth) {
	const gmail = google.gmail({ version: "v1", auth });
	const res = await gmail.users.watch({
		userId: "me",
	});
	const historyId = res.data.historyId;
	const expiration = res.data.expiration;

	console.log(expiration);
	console.log(historyId);
	gmail.users.stop({
		userId: "me",
	});
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
	const gmail = google.gmail({ version: "v1", auth });
	const res = await gmail.users.labels.list({
		userId: "me",
	});
	const labels = res.data.labels;
	if (!labels || labels.length === 0) {
		console.log("No labels found.");
		return;
	}
	console.log("Labels:");
	labels.forEach((label) => {
		console.log(`- ${label.name}`);
	});
}

async function checkSavedHistoryId(auth) {
	let latestHistoryId;
	await getEmails({
		select: { historyId: true },
		orderBy: { historyId: "desc" },
	})
		.then((data) => {
			latestHistoryId = data[0].historyId;
		})
		.catch(console.error);
	console.log("Latest: ", latestHistoryId);

	let listMessages;
	if (latestHistoryId) {
		listMessages = await syncEmails(auth, latestHistoryId);
	} else {
		listMessages = await listEmails(auth);
	}
	if (!listMessages || listMessages.length === 0) {
		return;
	}
	readMessagesAndSave(auth, listMessages);
}

/**
 * Syncs the emails in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function syncEmails(auth, historyId) {
	const gmail = google.gmail({ version: "v1", auth });
	const res = await gmail.users.history.list({
		userId: "me",
		maxResults: 100,
		startHistoryId: historyId,
	});
	console.log("syncEmail: ", res.data.history.messagesAdded);
	const messages = res.data.history[0].messagesAdded;
	if (!messages || messages.length === 0) {
		console.log("No emails found.");
		return;
	}

	return messages;
}

async function readMessagesAndSave(auth, messages) {
	for (const message of messages) {
		let idCheck;
		//console.log(message);

		await getEmails({
			where: {
				id: message.id,
			},
			select: { id: true },
		})
			.then((data) => {
				//console.log(data);
				if (data.length == 0) {
					idCheck = "-1";
				} else {
					idCheck = data[0].id;
				}
			})
			.catch(console.error);

		if (idCheck === message.id) {
			console.log("Duplicate Found");
			break;
		}

		const gmail = google.gmail({ version: "v1", auth });

		const msg = await gmail.users.messages.get({
			userId: "me",
			id: message.id,
			format: "raw",
		});
		//console.log(`Raw: ${msg.data.raw}`);
		const email = Buffer.from(msg.data.raw, "base64");

		const newEmailData = {
			id: msg.data.id,
			threadId: msg.data.threadId,
			labelIds: msg.data.labelIds,
			snippet: msg.data.snippet,
			historyId: msg.data.historyId,
			internalDate: msg.data.internalDate, // BigInt timestamp
			sizeEstimate: msg.data.sizeEstimate,
			from: null,
			raw: email,
			subject: null,
		};

		await simpleParser(email)
			.then((parsed) => {
				newEmailData.from = parsed.from.value[0].address;
				newEmailData.subject = parsed.subject;
			})
			.catch(console.error);

		await createEmail(newEmailData);
		console.log("Email Added To DB: ", message.id);

		switch (newEmailData.from) {
			case "USPSInformeddelivery@email.informeddelivery.usps.com":
				parseUSPSDAILY(newEmailData.id);
				break;
			case "auto-reply@usps.com":
				parseUSPSAUTO(newEmailData.id);
				break;
			case "mcinfo@ups.com":
				parseUPSINFO(newEmailData.id);
				break;
		}
	}
}

/**
 * Lists the emails in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEmails(auth) {
	const gmail = google.gmail({ version: "v1", auth });
	const res = await gmail.users.messages.list({
		userId: "me",
		maxResults: 100,
		q: "from:(usps.com) OR (ups.com) OR (fedex.com) ",
	});
	const messages = res.data.messages;
	console.log("listEmails: ", res.data.messages);

	if (!messages || messages.length === 0) {
		console.log("No emails found.");
		return;
	}
	readMessagesAndSave(auth, messages);
	return messages;
}

enum Carrier {
	UPS = "UPS",
	FedEx = "FedEx",
	USPS = "USPS",
	USPS_Daily = "USPS_Daily",
}

enum PackageStatus {
	Pending = "Pending",
	Shipped = "Shipped",
	OutForDelivery = "OutForDelivery",
	Delivered = "Delivered",
	Returned = "Returned",
}

interface Status {
	trackingId: string;
	deliveryDate: string;
	statusTime: string;
	status: PackageStatus;
}

interface Photo {
	filename: string;
	filesize: number;
	fileLocation: string;
}

interface PackageParcel {
	trackingId: string;
	carrier: Carrier;
	recentStatusTime: string;
	from?: string;
	statusHistory?: {
		create: Status[];
	};
	deliveryPhoto?: { create: Photo[] };
}

function determinePackageStatus(status: {
	outForDelivery: boolean;
	delivered: boolean;
	shipped: boolean;
	returned: boolean;
}): PackageStatus {
	switch (true) {
		case status.delivered:
			return PackageStatus.Delivered;

		case status.outForDelivery:
			return PackageStatus.OutForDelivery;

		case status.shipped:
			return PackageStatus.Shipped;

		case status.returned:
			return PackageStatus.Returned;

		default:
			return PackageStatus.Pending;
	}
}

/**
 *
 * @param id Email id from emails table id
 */
async function parseUSPSAUTO(id) {
	await getEmails({
		where: {
			id: id,
		},
		select: { raw: true },
	})
		.then((data) => {
			simpleParser(data[0].raw).then(async (parsed) => {
				const doc = new jsdom.JSDOM(parsed.html);

				const trackingLinkUSPS = doc.window.document.querySelector(
					'a[href^="https://tools.usps.com/go/TrackConfirmAction?"]'
				) as HTMLAnchorElement;

				let trackingNum;

				if (trackingLinkUSPS) {
					//console.log("USPS: ");
					const urlParams = new URLSearchParams(
						trackingLinkUSPS.href.split("?")[1]
					);
					trackingNum = urlParams.get("tLabels");

					if (trackingNum) {
						//console.log("Tracking number:", trackingNum);
					} else {
						console.log("Tracking number not found in the link.");
					}
				} else {
					return null;
				}

				const element = doc.window.document.querySelector(
					"tr > td[style*='text-align: center;font-size: 20px;']"
				);

				//console.log("Element:" + element + "END");

				if (element) {
					let text = element.textContent.trim();

					const deliveryDateRegex =
						/(?:by\s+|on\s+)(?:\w+,\s+)?(\w+\s+\d{1,2},\s+\d{4})/i;
					const timeRegex = /(?:at\s+|by\s+)+(\d{1,2}:\d{2}\s*[ap]m)/i;
					//const locationRegex = /in\s+([\w\s]+),\s+([A-Z]{2})\s+(\d{5})/i;
					const outForDeliveryRegex = /out for delivery/i;
					const shippedRegex = /expects to deliver/i;
					const deliveredRegex = /delivered/i;

					const dateMatch = text.match(deliveryDateRegex);
					const timeMatch = text.match(timeRegex);
					//const locationMatch = text.match(locationRegex);
					const outForDeliveryMatch = text.match(outForDeliveryRegex);
					const shippedMatch = text.match(shippedRegex);
					const deliveredMatch = text.match(deliveredRegex);

					//console.log("date " + dateMatch);
					//console.log("time " + timeMatch);

					if (!dateMatch || !timeMatch) {
						return null;
					}
					const formatedDate = parseDateTimeISO8601(dateMatch[1], timeMatch[1]);

					const emailDate = parsed.date.toISOString();

					let currentScanStatus = determinePackageStatus({
						outForDelivery: !!outForDeliveryMatch,
						delivered: !!deliveredMatch,
						shipped: !!shippedMatch,
						returned: false,
					});

					const statusInfo: Status = {
						trackingId: trackingNum,
						deliveryDate: formatedDate,
						status: currentScanStatus,
						statusTime: emailDate,
					};

					let currentStatusTime = emailDate;
					const recentTime = await getPackages({
						where: {
							trackingId: trackingNum,
						},
						select: {
							recentStatusTime: true,
						},
					});

					if (
						!!recentTime[0]?.recentStatusTime &&
						new Date(currentStatusTime).getTime() <
							new Date(recentTime[0].recentStatusTime).getTime()
					) {
						currentStatusTime = recentTime[0].recentStatusTime;
					}

					const packageInfo: PackageParcel = {
						trackingId: trackingNum,
						carrier: Carrier.USPS,
						statusHistory: { create: [statusInfo] },
						recentStatusTime: currentStatusTime,
					};

					const newPackage = await upsertPackage(packageInfo);
					console.log("USPS: ", trackingNum);

					return packageInfo;
				} else {
					console.log("Element not found!");
				}
			});
		})
		.catch(console.error);
}

async function parseUSPSDAILY(id) {
	await getEmails({
		where: {
			id: id,
		},
		select: { raw: true },
	})
		.then((data) => {
			simpleParser(data[0].raw).then(async (parsed) => {
				for (let i = 0; i < parsed.attachments.length; i++) {
					const date = parsed.date;
					const filename = parsed.attachments[i].filename;
					const fileSize = parsed.attachments[i].size;

					if (filename.includes("content") || filename.includes("mailer")) {
						continue;
					}

					const newFilename = `${date
						.toISOString()
						.replace(/T.*/g, "")}_${filename}`;

					const folderPath = path.join("photos", "USPS_Daily");
					try {
						await fs.promises.stat(folderPath);
					} catch {
						fs.mkdir(folderPath, { recursive: true });
					}
					const filePath = path.join(folderPath, newFilename);

					const trackingId = `USPSDAILY_${newFilename}`;
					const emailDate = date.toISOString();

					const photoInfo: Photo = {
						filename: newFilename,
						filesize: fileSize,
						fileLocation: filePath,
					};

					const statusInfo: Status = {
						trackingId: trackingId,
						deliveryDate: date,
						status: PackageStatus.Pending,
						statusTime: emailDate,
					};

					const packageInfo: PackageParcel = {
						trackingId: trackingId,
						carrier: Carrier.USPS_Daily,
						recentStatusTime: emailDate,
						deliveryPhoto: { create: [photoInfo] },
						statusHistory: {
							create: [statusInfo],
						},
					};

					const newPackage = await upsertPackage(packageInfo);

					//console.log(newPackage);
					console.log("USPS_Daily: ", trackingId);
					const imgBuffer = Buffer.from(
						parsed.attachments[i].content,
						"base64"
					);
					fs.writeFile(filePath, imgBuffer, (err) => {
						if (err) throw err;
					});
				}
			});
		})
		.catch(console.error);
}

async function parseUPSINFO(id) {
	await getEmails({
		where: {
			id: id,
		},
		select: { raw: true },
	})
		.then((data) => {
			simpleParser(data[0].raw).then(async (parsed) => {
				const doc = new jsdom.JSDOM(parsed.html);
				const trackingLinkUPS = doc.window.document.querySelector(
					'a[href^="https://www.ups.com/track?"]'
				) as HTMLAnchorElement;

				const urlParams = new URLSearchParams(
					trackingLinkUPS.href.split("?")[1]
				);
				const trackingNum = urlParams.get("tracknum");

				if (trackingNum) {
					//console.log("Tracking number:", trackingNum);
				} else {
					console.log("Tracking number not found in the link.");
					return null;
				}

				const element = doc.window.document.querySelector("tbody");

				//console.log("Element:" + element + "END");

				if (element) {
					// Get the text content
					let text = element.textContent;
					//console.log("text" + text);

					const deliveryDateRegex = /(\d{1,2}\/\d{1,2}\/\d{4})/i;
					const timeRegex = /(-\s+)+(\d{1,2}:\d{2}\s*[ap]m)/i;
					const outForDeliveryRegex = /Your package is arriving today./i;
					const shippedRegex = /Your package is arriving tomorrow/i;
					const deliveredRegex = /Your package was delivered./i;

					const from = doc.window.document.querySelector("#shipperAndArrival");
					//console.log("from" + from.textContent.replace("From", "").trim());
					const formatedFrom = from.textContent.replace("From", "").trim();

					const dateMatch = text.match(deliveryDateRegex);
					const timeMatch = text.match(timeRegex);
					const outForDeliveryMatch = text.match(outForDeliveryRegex);
					const shippedMatch = text.match(shippedRegex);
					const deliveredMatch = text.match(deliveredRegex);

					//console.log("date " + dateMatch[1]);
					//console.log("time " + timeMatch[2]);

					const emailDate = parsed.date.toISOString();

					let parsedDate;
					let parsedTime;

					if (!dateMatch) {
						parsedDate = parsed.date.toDateString();
					} else {
						parsedDate = dateMatch[1];
					}

					if (!timeMatch) {
						parsedTime = "02:30 PM";
					} else {
						parsedTime = timeMatch[2];
					}
					const formatedDate = parseDateTimeISO8601(parsedDate, parsedTime);

					//console.log(outForDeliveryMatch);

					let currentScanStatus = determinePackageStatus({
						outForDelivery: !!outForDeliveryMatch,
						delivered: !!deliveredMatch,
						shipped: !!shippedMatch,
						returned: false,
					});

					const statusInfo: Status = {
						trackingId: trackingNum,
						deliveryDate: formatedDate,
						status: currentScanStatus,
						statusTime: emailDate,
					};

					let currentStatusTime = emailDate;
					const recentTime = await getPackages({
						where: {
							trackingId: trackingNum,
						},
						select: {
							recentStatusTime: true,
						},
					});

					if (
						!!recentTime[0]?.recentStatusTime &&
						new Date(currentStatusTime).getTime() <
							new Date(recentTime[0].recentStatusTime).getTime()
					) {
						currentStatusTime = recentTime[0].recentStatusTime;
					}

					let packageInfo: PackageParcel;
					if (parsed.attachments.length > 0) {
						const fileSize = parsed.attachments[0]?.size || 0;

						const newFilename = `${emailDate.replace(
							/T.*/g,
							""
						)}_${trackingNum}`;

						const folderPath = path.join("photos", "UPS_INFO");
						try {
							await fs.promises.stat(folderPath);
						} catch {
							fs.mkdir(folderPath, { recursive: true });
						}
						const filePath = path.join(folderPath, newFilename);

						const deliveryPhoto: Photo = {
							filename: newFilename,
							filesize: fileSize,
							fileLocation: filePath,
						};

						packageInfo = {
							trackingId: trackingNum,
							carrier: Carrier.UPS,
							from: formatedFrom,
							statusHistory: { create: [statusInfo] },
							deliveryPhoto: {
								create: [deliveryPhoto],
							},
							recentStatusTime: currentStatusTime,
						};

						const imgBuffer = Buffer.from(
							parsed.attachments[0].content,
							"base64"
						);
						fs.writeFile(filePath, imgBuffer, (err) => {
							if (err) throw err;
						});
					} else {
						packageInfo = {
							trackingId: trackingNum,
							carrier: Carrier.UPS,
							from: formatedFrom,
							statusHistory: { create: [statusInfo] },
							recentStatusTime: currentStatusTime,
						};
					}

					const newPackage = await upsertPackage(packageInfo);
					console.log("UPS: ", trackingNum);

					return packageInfo;
				} else {
					console.log("Element not found!");
				}
			});
		})
		.catch(console.error);
}

function parseDateTimeISO8601(deliveryDate: string, time: string): string {
	const timeParts = time.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
	const [, hours, minutes, ampm] = timeParts;

	let hourNumber = parseInt(hours, 10);
	if (ampm.toUpperCase() === "PM" && hourNumber !== 12) {
		hourNumber += 12;
	}
	console.log(`${deliveryDate} ${hourNumber}:${minutes}`);

	const combinedDateTimeString = `${deliveryDate} ${hourNumber}:${minutes}`;
	//console.log(combinedDateTimeString + "---");

	return new Date(combinedDateTimeString).toISOString();
}

const task = cron.schedule("*/20 * * * *", () => {
	authorize().then(listEmails).catch(console.error);
	console.log(
		"Checking For New Emails " +
			new Date().getHours() +
			":" +
			new Date().getMinutes()
	);
});

app.get("/", (req, res) => {
	res.send("API Endpoint");
});

app.use(
	"/",
	cors({
		origin: process.env.URL,
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization", "API_KEY"],
	})
);

app.use(express.json());

app.use("/", emailRoute);
app.use("/", packageRoute);
app.use((err, req, res, next) => {
	if (res.statusCode === 200) {
		res.statusCode = 500;
	}
	res.status(res.statusCode || 500).json({ error: err.message });
});

const startServer = async () => {
    try {
		await authorize()
        // Try to read SSL certificates
        const key = fsFile.readFileSync("agent2-key.pem");
        const cert = fsFile.readFileSync("agent2-cert.pem");
        
        const options = { key, cert };
        
        // Start HTTPS server if certificates are found
        https.createServer(options, app).listen(port, async () => {
            console.log(`HTTPS Server running at https://localhost:${port}`);
            task.start();
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Start Local server if certificates are not found
            app.listen(port, async () => {
                console.log(`HTTP Server running at http://localhost:${port}`);
                console.warn('Warning: Running in Local mode as SSL certificates were not found.');
                console.warn('For production, please provide valid SSL certificates.');
                task.start();
            });
        } else {
            console.error('Server startup error:', error);
            process.exit(1);
        }
    }
};

startServer().catch(error => {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
});