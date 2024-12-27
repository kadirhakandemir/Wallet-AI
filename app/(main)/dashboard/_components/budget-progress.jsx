"use client"
import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, Pencil, X } from 'lucide-react'
import { updateBudget } from '@/actions/budget'
import { toast } from 'sonner'
import useFetch from "@/hooks/use-fetch";
import { Progress } from '@/components/ui/progress'

const BudgetProgress = ({ initialBudget, currentExpenses }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newBudget, setNewBudget] = useState(initialBudget?.amount?.toString() || "");

    const percentUsed = initialBudget ? (currentExpenses / initialBudget.amount) * 100 : 0;

    const {
        loading: isLoading,
        fn: updateBudgetFn,
        data: updatedBudget,
        error,
    } = useFetch(updateBudget);


    const handleUpdateBudget = async () => {
        const amount = parseFloat(newBudget);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        await updateBudgetFn(amount);
        setIsEditing(false);
    }
    useEffect(() => {
        if (updatedBudget?.success) {
            toast.success("Budget updated successfully");
        }
    }, [updatedBudget, isLoading]);

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);

    const handleCancel = async () => {
        setNewBudget(initialBudget?.amount?.toString() || "");
        setIsEditing(false);
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className='flex-1'>
                    <CardTitle>Monthly Budget (Default Account )</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                        {isEditing ? (
                            <div className='flex items-center gap-2'>
                                <Input
                                    value={newBudget}
                                    type="number"
                                    onChange={(e) => setNewBudget(e.target.value)}
                                    className="w-32"
                                    placeholder="Enter amount"
                                    autoFocus
                                    disabled={isLoading} />
                                <Button variant="ghost" size="icon" disabled={isLoading} onClick={handleUpdateBudget}>
                                    <Check className="w-4 h-4 text-green-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleCancel}>
                                    <X className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <CardDescription>
                                    {initialBudget
                                        ? `$${currentExpenses.toFixed(2)} of $${initialBudget.amount.toFixed(2)} spent`
                                        : "No budget set"}
                                </CardDescription>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsEditing(true)}
                                    className="h-6 w-6"
                                >
                                    <Pencil className="w-3 h-3" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {initialBudget && (
                    <div className="space-y-2">
                        <Progress
                            value={percentUsed}
                            extrastyle={`${percentUsed >= 90
                                ? "bg-red-500"
                                : percentUsed >= 75
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                        />
                        <p className='text-xs text-muted-foreground text-right'>
                            {percentUsed.toFixed(1)}% used
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default BudgetProgress