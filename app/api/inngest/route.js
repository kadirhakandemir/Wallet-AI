import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { checkBudgetAlerts, generateMonthlyReports, processRecurringTransaction, triggerRecurringTransactions } from "@/lib/inngest/functions";
// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        checkBudgetAlerts,
        triggerRecurringTransactions,
        processRecurringTransaction,
        generateMonthlyReports,
        /* your functions will be passed here later! */
    ],
});