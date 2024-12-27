import { seedTransactions } from "@/actions/seed";

export async function GET() {
    const result = seedTransactions();
    return Response.json(result);

}