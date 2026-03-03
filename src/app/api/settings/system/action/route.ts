import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    if (!action) {
      return NextResponse.json({ error: "No action provided" }, { status: 400 });
    }

    // In a real application, you would perform server-side tasks here.
    // E.g.
    // if (action === 'clear_cache') {
    //   await clearNextJsCache(); // Logic to purge data cache or temp files
    // }
    // if (action === 'optimize_db') {
    //   await prisma.$executeRawUnsafe(`OPTIMIZE TABLE ...`);
    // }

    // Mock delay to simulate work:
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      message: `Action '${action}' completed successfully.`,
      action: action,
    });
  } catch (error) {
    console.error("Error executing system action:", error);
    return NextResponse.json({ error: "Failed to execute action" }, { status: 500 });
  }
}
