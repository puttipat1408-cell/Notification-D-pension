import { createRequest, createServerErrorResponse, getRequests } from "@/lib/requests";
import { createRequestSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requests = await getRequests({
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });
    return Response.json(requests, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    return createServerErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = createRequestSchema.parse(await request.json());
    const result = await createRequest(payload);
    return Response.json(result);
  } catch (error) {
    return createServerErrorResponse(error);
  }
}
