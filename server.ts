import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { CivicReport, IssueCategory, IssuePriority, IssueStatus, ChatMessage } from "./src/types";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, getDocs, setDoc, getDoc, getDocFromServer } from "firebase/firestore";

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Firebase and Firestore from generated config
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Firestore Error Handling
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection validated successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Initialize GoogleGenAI server-side
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Initial Seeded Data (SaaS platform ready)
const initialSeededReports: CivicReport[] = [
  {
    id: "rep-001",
    title: "Major Pothole on Broad Street Main Arterial",
    description: "Deep, multi-lane pothole on the rightmost lane of Broad St, causing cars to swerve dangerously into oncoming traffic. Exposed rebar visible at the bottom.",
    category: "Road Damage",
    latitude: 37.7749,
    longitude: -122.4194,
    gpsAddress: "455 Broad St, San Francisco, CA 94102",
    priority: "High",
    status: "In Progress",
    department: "Department of Public Works",
    estimatedCost: 1850,
    severity: 75,
    contractor: "Pacific Infrastructure Partners",
    reporterName: "Marcus Vance",
    reportedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    upvotes: 42,
    isVerified: true,
    isEmergency: false,
    sentimentScore: "Negative",
    fraudDetected: false,
    aiSummary: "Hazardous multi-lane pothole with exposed structural grid causing dangerous driver behavior.",
    history: [
      {
        status: "Reported",
        message: "Report submitted by citizen with high-res photo evidence.",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Marcus Vance",
      },
      {
        status: "Verified",
        message: "AI Duplicate analysis: Clean. Authority verified severity score of 75/100.",
        timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "CivicIQ AI Engine",
      },
      {
        status: "Assigned",
        message: "Assigned to Dept of Public Works (Sub-budget: Arterials).",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Admin System",
      },
      {
        status: "Accepted",
        message: "Pacific Infrastructure Partners accepted task allocation with 48h resolution SLA.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Pacific Infrastructure Partners",
      },
      {
        status: "In Progress",
        message: "Crews dispatched. Asphalt milling and subsurface stabilization active.",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Pacific Infrastructure Partners",
      },
    ],
  },
  {
    id: "rep-002",
    title: "Subsurface Main Water Leakage",
    description: "Significant water bubbling up through sidewalk expansion joints. It is washing out soil beneath the pavement, threatening to create a sinkhole.",
    category: "Water Leakage",
    latitude: 37.7833,
    longitude: -122.4167,
    gpsAddress: "820 Geary Blvd, San Francisco, CA 94109",
    priority: "Critical",
    status: "Assigned",
    department: "Water and Sewer Authority",
    estimatedCost: 6200,
    severity: 90,
    contractor: "Cascade Water Group",
    reporterName: "Elena Rostova",
    reportedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
    upvotes: 68,
    isVerified: true,
    isEmergency: true,
    sentimentScore: "Negative",
    fraudDetected: false,
    aiSummary: "Subsurface main break eroding road foundation with imminent structural sinkhole risk.",
    history: [
      {
        status: "Reported",
        message: "Urgent citizen report filed. Heavy volume bubbling noted.",
        timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Elena Rostova",
      },
      {
        status: "Verified",
        message: "AI Safety Monitor flagged: CRITICAL risk of structural collapse. Priority set to Critical.",
        timestamp: new Date(Date.now() - 1.4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "CivicIQ Emergency AI",
      },
      {
        status: "Assigned",
        message: "Routed to Emergency Leak Team & Cascade Water Group.",
        timestamp: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Water and Sewer Authority",
      },
    ],
  },
  {
    id: "rep-003",
    title: "Illegal Industrial Waste Dumping",
    description: "Commercial truck dumped over 20 rusted paint cans and chemical containers in the park pathway adjacent to the creek. Paint has started leaking onto the soil.",
    category: "Garbage",
    latitude: 37.7699,
    longitude: -122.4468,
    gpsAddress: "Buena Vista Heights Trail, San Francisco, CA 94117",
    priority: "High",
    status: "Completed",
    department: "Environmental Health",
    estimatedCost: 3400,
    severity: 80,
    contractor: "Apex Environmental Services",
    reporterName: "Jonathan Chen",
    reportedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    upvotes: 55,
    isVerified: true,
    isEmergency: false,
    sentimentScore: "Negative",
    fraudDetected: false,
    aiSummary: "Illegal chemical and industrial dump threatening creek ecological pathways.",
    history: [
      {
        status: "Reported",
        message: "Report submitted with photos of truck plates and leaking canisters.",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Jonathan Chen",
      },
      {
        status: "Verified",
        message: "AI Plate Scanner extracted registration data. Environmental damage verified.",
        timestamp: new Date(Date.now() - 6.5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "CivicIQ OCR Service",
      },
      {
        status: "Assigned",
        message: "Allocated to toxic containment crew Apex Environmental Services.",
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Environmental Health",
      },
      {
        status: "Accepted",
        message: "Apex Environmental accepted dispatch.",
        timestamp: new Date(Date.now() - 5.8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Apex Environmental Services",
      },
      {
        status: "In Progress",
        message: "Chemical containment barrels deployed. Soil neutralizing agent applied.",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Apex Environmental Services",
      },
      {
        status: "Completed",
        message: "All toxic material removed and pathway vacuum-cleaned. Before/after photos uploaded.",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Apex Environmental Services",
      },
    ],
  },
  {
    id: "rep-004",
    title: "Unresponsive High-Voltage Streetlight Grid",
    description: "The entire block of streetlights on 18th Ave has been dark for three consecutive nights. Concerns about pedestrian safety and property vandalism have risen.",
    category: "Streetlight",
    latitude: 37.7550,
    longitude: -122.4750,
    gpsAddress: "1420 18th Ave, San Francisco, CA 94122",
    priority: "Medium",
    status: "Verified",
    department: "Energy and Grid Division",
    estimatedCost: 750,
    severity: 45,
    contractor: "Metropolitan Grid Solutions",
    reporterName: "Claire Dupont",
    reportedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(), // 2.5 days ago
    upvotes: 31,
    isVerified: true,
    isEmergency: false,
    sentimentScore: "Neutral",
    fraudDetected: false,
    aiSummary: "Localized grid circuit blackout impacting the entire residential street block.",
    history: [
      {
        status: "Reported",
        message: "Citizen filed report outlining a 3-night complete blackout.",
        timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Claire Dupont",
      },
      {
        status: "Verified",
        message: "Automated grid query confirms zero-current reading on circuit SG-18A. Report verified.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "CivicIQ IoT Integration",
      },
    ],
  },
  {
    id: "rep-005",
    title: "Cracked Oak Tree Branch Dangling Over Sidewalk",
    description: "Massive cracked branch on the municipal oak tree. It is suspended purely by a couple of fibers directly above the school walking path.",
    category: "Tree Hazards",
    latitude: 37.7610,
    longitude: -122.4350,
    gpsAddress: "492 Castro St, San Francisco, CA 94114",
    priority: "High",
    status: "Reported",
    department: "Municipal Forestry",
    estimatedCost: 950,
    severity: 70,
    contractor: "Standard Municipal Maintenance",
    reporterName: "Tobias Funke",
    reportedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    upvotes: 19,
    isVerified: false,
    isEmergency: false,
    sentimentScore: "Negative",
    fraudDetected: false,
    aiSummary: "Imminent overhead hazard from large fractured tree limb above a heavy school walkway.",
    history: [
      {
        status: "Reported",
        message: "Urgent tree hazard ticket opened with location details.",
        timestamp: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: "Tobias Funke",
      },
    ],
  },
];

let reports: CivicReport[] = [];

async function syncReportsFromFirestore() {
  try {
    const colRef = collection(db, "reports");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log("Firestore reports collection is empty. Seeding initial 5 reports...");
      for (const r of initialSeededReports) {
        try {
          await setDoc(doc(db, "reports", r.id), r);
        } catch (seedErr) {
          console.warn(`Failed to seed report ${r.id} to Firestore:`, seedErr);
        }
      }
      reports = [...initialSeededReports];
    } else {
      const dbReports: CivicReport[] = [];
      snapshot.forEach((docSnap) => {
        dbReports.push(docSnap.data() as CivicReport);
      });
      dbReports.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
      reports = dbReports;
      console.log(`Synced ${reports.length} reports successfully from Firestore.`);
    }
  } catch (error) {
    console.warn("Firestore sync failed. Falling back to in-memory seeded reports:", error);
    reports = [...initialSeededReports];
  }
}

// Helper to compile a summary list of existing reports for duplication analysis
function getReportsSummary() {
  return reports.map(r => ({
    id: r.id,
    title: r.title,
    category: r.category,
    gpsAddress: r.gpsAddress,
    status: r.status,
  }));
}

// API Endpoints
app.get("/api/reports", (req, res) => {
  res.json(reports);
});

// Create report endpoint (with real Gemini processing)
app.post("/api/reports", async (req, res) => {
  try {
    const { description, category: userCategory, latitude, longitude, gpsAddress, reporterName, imageUrl } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description is required." });
    }

    const reportId = `rep-${String(reports.length + 1).padStart(3, "0")}`;
    const defaultLat = latitude || 37.7749 + (Math.random() - 0.5) * 0.05;
    const defaultLng = longitude || -122.4194 + (Math.random() - 0.5) * 0.05;
    const defaultAddress = gpsAddress || "Custom Geotagged Location, San Francisco, CA";

    let aiResults: any = null;

    if (ai) {
      try {
        const prompt = `Analyze this civic issue report submitted by a citizen.
User-Provided Description: "${description}"
User-Reported Category Suggestion: "${userCategory || "Uncategorized"}"
Existing reports in database: ${JSON.stringify(getReportsSummary())}

Analyze and return a JSON object containing the following exact fields:
1. title: (string) A concise, professional, SaaS-ready title for this issue.
2. category: (string) Must be exactly one of: "Road Damage", "Garbage", "Streetlight", "Water Leakage", "Drainage", "Illegal Parking", "Tree Hazards", "Public Safety", "Noise Pollution", "Electric Hazards", "Construction Damage".
3. priority: (string) Must be exactly one of: "Low", "Medium", "High", "Critical".
4. department: (string) Recommended municipal department to handle this (e.g., "Department of Public Works", "Water and Sewer Authority", "Municipal Forestry", "Traffic Control Bureau", "Environmental Health", "Energy and Grid Division").
5. estimatedCost: (number) Estimated cost of repair/resolution in USD.
6. severity: (number) A severity score from 1 (minor) to 100 (immediate major crisis).
7. contractor: (string) A suggested premium contractor name (e.g., "Pacific Infrastructure Partners", "Apex Environmental Services", "Metropolitan Grid Solutions", "Cascade Water Group", "Standard Municipal Maintenance").
8. isEmergency: (boolean) True if this poses an immediate threat to life/safety.
9. sentimentScore: (string) One of "Positive", "Neutral", "Negative".
10. fraudDetected: (boolean) True if description contains obvious gibberish, commercial spam, or fraud.
11. aiSummary: (string) 1-2 sentence technical summary of the problem.
12. isDuplicateOf: (string or null) The ID of an existing report if this issue describes the EXACT same issue/location, or null.

Return ONLY raw JSON. Do not wrap in markdown block code tags.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                priority: { type: Type.STRING },
                department: { type: Type.STRING },
                estimatedCost: { type: Type.NUMBER },
                severity: { type: Type.NUMBER },
                contractor: { type: Type.STRING },
                isEmergency: { type: Type.BOOLEAN },
                sentimentScore: { type: Type.STRING },
                fraudDetected: { type: Type.BOOLEAN },
                aiSummary: { type: Type.STRING },
                isDuplicateOf: { type: Type.STRING },
              },
              required: [
                "title", "category", "priority", "department", 
                "estimatedCost", "severity", "contractor", 
                "isEmergency", "sentimentScore", "fraudDetected", "aiSummary"
              ],
            },
          },
        });

        const text = response.text || "{}";
        aiResults = JSON.parse(text.trim());
      } catch (err) {
        console.error("Gemini processing error:", err);
        // Fallback below will be triggered
      }
    }

    // Comprehensive heuristic fallback if Gemini is missing or fails
    if (!aiResults) {
      const descLower = description.toLowerCase();
      let category: IssueCategory = (userCategory as IssueCategory) || "Garbage";
      let priority: IssuePriority = "Medium";
      let department = "Department of Public Works";
      let estimatedCost = 450;
      let severity = 30;
      let contractor = "Standard Municipal Maintenance";
      let isEmergency = false;

      if (descLower.includes("pothole") || descLower.includes("road") || descLower.includes("asphalt") || descLower.includes("pavement")) {
        category = "Road Damage";
        department = "Department of Public Works";
        estimatedCost = 1200;
        severity = 60;
        priority = "High";
        contractor = "Pacific Infrastructure Partners";
      } else if (descLower.includes("leak") || descLower.includes("water") || descLower.includes("pipe") || descLower.includes("burst")) {
        category = "Water Leakage";
        department = "Water and Sewer Authority";
        estimatedCost = 4500;
        severity = 85;
        priority = "Critical";
        contractor = "Cascade Water Group";
        isEmergency = true;
      } else if (descLower.includes("light") || descLower.includes("dark") || descLower.includes("bulb") || descLower.includes("streetlight")) {
        category = "Streetlight";
        department = "Energy and Grid Division";
        estimatedCost = 600;
        severity = 40;
        contractor = "Metropolitan Grid Solutions";
      } else if (descLower.includes("tree") || descLower.includes("branch") || descLower.includes("falling") || descLower.includes("leaf")) {
        category = "Tree Hazards";
        department = "Municipal Forestry";
        estimatedCost = 850;
        severity = 55;
        priority = "High";
        contractor = "Standard Municipal Maintenance";
      } else if (descLower.includes("dump") || descLower.includes("trash") || descLower.includes("waste") || descLower.includes("garbage")) {
        category = "Garbage";
        department = "Environmental Health";
        estimatedCost = 1400;
        severity = 50;
        contractor = "Apex Environmental Services";
      }

      aiResults = {
        title: `Reported ${category}: ${description.slice(0, 35)}...`,
        category,
        priority,
        department,
        estimatedCost,
        severity,
        contractor,
        isEmergency,
        sentimentScore: descLower.includes("angry") || descLower.includes("danger") ? "Negative" : "Neutral",
        fraudDetected: false,
        aiSummary: `AI-detected ${category} issue in ward district. Standard workflow assigned automatically.`,
        isDuplicateOf: null,
      };
    }

    const newReport: CivicReport = {
      id: reportId,
      title: aiResults.title,
      description: description,
      category: aiResults.category,
      imageUrl: imageUrl || `https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80`, // nice stock placeholder fallback
      latitude: defaultLat,
      longitude: defaultLng,
      gpsAddress: defaultAddress,
      priority: aiResults.priority,
      status: "Reported",
      department: aiResults.department,
      estimatedCost: aiResults.estimatedCost,
      severity: aiResults.severity,
      contractor: aiResults.contractor,
      reporterName: reporterName || "Anonymous Citizen",
      reportedAt: new Date().toISOString(),
      upvotes: 0,
      isVerified: false,
      isEmergency: aiResults.isEmergency,
      sentimentScore: aiResults.sentimentScore || "Neutral",
      fraudDetected: aiResults.fraudDetected || false,
      aiSummary: aiResults.aiSummary,
      history: [
        {
          status: "Reported",
          message: "Report filed by user. Core parameters extracted.",
          timestamp: new Date().toISOString(),
          updatedBy: reporterName || "Anonymous Citizen",
        },
      ],
    };

    // Auto upvote duplicate instead of adding if duplicate detected
    if (aiResults.isDuplicateOf) {
      const match = reports.find(r => r.id === aiResults.isDuplicateOf);
      if (match) {
        match.upvotes += 1;
        match.history.push({
          status: match.status,
          message: `Linked duplicate report filed. Credibility confidence boosted.`,
          timestamp: new Date().toISOString(),
          updatedBy: "CivicIQ Deduplication",
        });

        try {
          await setDoc(doc(db, "reports", match.id), match);
        } catch (err) {
          console.warn(`Firestore save failed for duplicate report ${match.id}. Falling back to in-memory cache:`, err);
        }

        return res.json({
          duplicate: true,
          matchedReport: match,
          message: "An identical issue has already been registered nearby. We have added your ticket as an upvote and verification vote to expedite response.",
        });
      }
    }

    try {
      await setDoc(doc(db, "reports", newReport.id), newReport);
    } catch (err) {
      console.warn(`Firestore save failed for new report ${newReport.id}. Falling back to in-memory cache:`, err);
    }

    reports.unshift(newReport);
    res.json({ duplicate: false, report: newReport });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Report Status / Action Endpoint
app.post("/api/reports/:id/action", async (req, res) => {
  const { id } = req.params;
  const { action, status, upvote, comment, updatedBy } = req.body;

  const report = reports.find(r => r.id === id);
  if (!report) {
    return res.status(404).json({ error: "Report not found." });
  }

  if (upvote) {
    report.upvotes += 1;
    report.history.push({
      status: report.status,
      message: `${updatedBy || "A citizen"} upvoted this report.`,
      timestamp: new Date().toISOString(),
      updatedBy: updatedBy || "Citizen",
    });

    try {
      await setDoc(doc(db, "reports", id), report);
    } catch (err) {
      console.warn(`Firestore save failed for upvote on report ${id}. Falling back to in-memory cache:`, err);
    }

    return res.json(report);
  }

  if (status) {
    const oldStatus = report.status;
    report.status = status as IssueStatus;
    
    // Auto-mark verified if transitions beyond Reported
    if (status !== "Reported" && !report.isVerified) {
      report.isVerified = true;
    }

    report.history.push({
      status: report.status,
      message: comment || `Status updated from ${oldStatus} to ${status}.`,
      timestamp: new Date().toISOString(),
      updatedBy: updatedBy || "Official Administrator",
    });

    try {
      await setDoc(doc(db, "reports", id), report);
    } catch (err) {
      console.warn(`Firestore save failed for status update on report ${id}. Falling back to in-memory cache:`, err);
    }

    return res.json(report);
  }

  res.status(400).json({ error: "No recognized action provided." });
});

// Conversational AI Assistant
app.post("/api/assistant", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const latestMessage = messages[messages.length - 1]?.text || "";

    if (ai) {
      try {
        const systemInstruction = `You are CivicIQ's expert conversational AI Citizen and Municipal Assistant.
You assist citizens and city staff in understanding current issues, tracking repair workflows, reviewing budgets, and planning municipal efforts.

Here is the exact real-time list of reports logged in the city database:
${JSON.stringify(getReportsSummary())}

Use this context to answer user queries with extreme accuracy. If they ask about broad street, main leak, tree hazards, or list general problems, point to these records explicitly!
Explain the technical workflow: Reported -> Verified -> Assigned -> Accepted -> In Progress -> Completed -> Citizen Confirmed -> Archived.
Keep your tone premium, expert, helpful, and concise. Avoid rambling. Use bullet points where appropriate.`;

        const chatSession = ai.chats.create({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction,
          },
        });

        // Feed conversation history to establish context
        for (let i = 0; i < messages.length - 1; i++) {
          await chatSession.sendMessage({ message: messages[i].text });
        }

        const result = await chatSession.sendMessage({ message: latestMessage });
        return res.json({ response: result.text });
      } catch (err) {
        console.error("Gemini assistant error:", err);
        // Fall back below
      }
    }

    // Heuristic assistant fallback
    const text = latestMessage.toLowerCase();
    let reply = "I am the CivicIQ AI Assistant. ";

    if (text.includes("hello") || text.includes("hi")) {
      reply += "Hello! How can I help you navigate civic reports, analyze municipal workflows, or track contractor allocations today?";
    } else if (text.includes("report") || text.includes("issue") || text.includes("list")) {
      reply += `Currently, the city has ${reports.length} active registered issues.
- **Water Leakage** (Critical) on Geary Blvd: Assigned to Cascade Water Group.
- **Road Damage** (High) on Broad St: In Progress by Pacific Infrastructure.
- **Tree Hazards** (High) on Castro St: Pending Verification.
- **Illegal Dumping** (High) on Buena Vista heights: Successfully Completed.
Which issue would you like a detailed technical timeline on?`;
    } else if (text.includes("pothole") || text.includes("broad")) {
      reply += "The Broad Street pothole (rep-001) is currently in **In Progress** state. Pacific Infrastructure Partners is performing pavement milling and stabilization. It has 42 citizen upvotes and is expected to reach 'Completed' soon.";
    } else if (text.includes("leak") || text.includes("water") || text.includes("geary")) {
      reply += "The Geary Blvd water leak (rep-002) is flagged as **Critical** and **Emergency**. It is assigned to 'Cascade Water Group' to stop subsurface sidewalk washouts and prevent sinkhole hazards.";
    } else {
      reply += "We are currently monitoring city-wide sensors and citizen reports. Feel free to ask me about active pothole repairs, emergency water line leaks, environmental tree trimming, or how our 8-stage intelligent SaaS dispatching operates!";
    }

    res.json({ response: reply });
  } catch (error) {
    console.error("Assistant endpoint error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Setup Vite Dev Server / Static Files Serving
async function startServer() {
  // Sync all reports from Firestore database on boot (creates collections/seeds if empty)
  await syncReportsFromFirestore();

  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CivicIQ Full-Stack Server boot complete. Listening on http://localhost:${PORT}`);
  });
}

startServer();
