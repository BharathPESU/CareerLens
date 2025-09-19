
import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

// Helper to convert Firestore Timestamps to strings for JSON serialization
const convertTimestampsToISO = (data: any) => {
    if (!data) return null;
    const newData = { ...data };
    for (const key in newData) {
        if (newData[key] instanceof Timestamp) {
            newData[key] = (newData[key] as Timestamp).toDate().toISOString();
        }
    }
    return newData;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "Missing or invalid UID" }, { status: 400 });
    }

    const docRef = adminDb.collection("users").doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
       // If the profile doesn't exist, create and return a default one.
       const defaultProfile = {
            name: '',
            email: '',
            phone: '',
            dob: null,
            gender: '',
            photoURL: '',
            linkedin: '',
            github: '',
            summary: '',
            careerGoals: '',
            education: [],
            experience: [],
            skills: [],
            interests: [],
            preferences: {
                location: '',
                remote: false,
                industries: [],
            },
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        // We don't save it here, we just return the shape. It will be saved on first POST.
        const data = convertTimestampsToISO(defaultProfile);
        return NextResponse.json(data, { status: 200 });
    }
    
    // If the profile exists, return its data.
    const data = convertTimestampsToISO(docSnap.data());
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Profile GET API error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const { uid, profileData } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: "Missing UID" }, { status: 400 });
    }
     if (!profileData) {
      return NextResponse.json({ error: "Missing profile data" }, { status: 400 });
    }

    const docRef = adminDb.collection("users").doc(uid);
    const docSnap = await docRef.get();

    const dataToSave: any = {
      ...profileData,
      updatedAt: Timestamp.now(), // Always update the timestamp
    };
    
    // Convert string date back to Timestamp if it exists
    if (dataToSave.dob && typeof dataToSave.dob === 'string') {
        dataToSave.dob = Timestamp.fromDate(new Date(dataToSave.dob));
    }


    if (!docSnap.exists) {
        dataToSave.createdAt = Timestamp.now();
    }

    await docRef.set(dataToSave, { merge: true });

    return NextResponse.json({ message: "Profile saved successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Profile POST API error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
