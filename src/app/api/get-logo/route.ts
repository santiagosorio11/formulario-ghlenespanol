import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json({ error: "Missing locationId" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://services.leadconnectorhq.com/locations/${locationId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.GHL_BEARER_TOKEN}`,
        Version: "2021-07-28",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Location not found or unauthorized" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ logoUrl: data.location?.logoUrl || null });
  } catch (error) {
    console.error("Error fetching location logo:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
