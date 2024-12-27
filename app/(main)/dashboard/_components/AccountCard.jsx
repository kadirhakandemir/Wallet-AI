"use client"

import React, { useEffect } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Switch } from '@/components/ui/switch';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import useFetch from '@/hooks/use-fetch';
import { updateDefaultAccount } from '@/actions/account';
import { toast } from 'sonner';


const AccountCard = ({ account }) => {

    const { name, type, balance, isDefault, id } = account;

    const {
        loading: updateDefaultLoading,
        fn: updateDefaultFn,
        data: updatedAccount,
        error,
    } = useFetch(updateDefaultAccount);

    const handleDefaultChange = async () => {
        event.preventDefault();

        if (isDefault) {
            toast.warning("You need atleast 1 default account");
            return;
        }
        await updateDefaultFn(id);
    }

    useEffect(() => {
        if (updatedAccount?.success) {
            toast.success("Account updated successfully");
        }
    }, [updatedAccount, updateDefaultLoading]);

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);


    return (
        <div>
            <Card className='hover:shadow-md transition-shadow cursor-pointer group relative'>
                <Link href={`/account/${id}`}>
                    <CardHeader className='flex flex-row items-center space-y-0 pb-2 justify-between'>
                        <CardTitle className='text-sm font-medium capitalize'>{name}</CardTitle>
                        <Switch
                            defaultChecked={isDefault}
                            onCheckedChange={handleDefaultChange}
                            disabled={updateDefaultLoading} />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            ${parseFloat(balance).toFixed(2)}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                            {type.charAt(0) + type.slice(1).toLowerCase()} Account
                        </p>
                    </CardContent>
                    <CardFooter className='flex justify-between text-sm text-muted-foreground'>
                        <div className='flex items-center'>
                            <ArrowUpRight className='h-4 w-4 mr-1 text-green-500' />
                            Income
                        </div>
                        <div className='flex items-center'>
                            <ArrowDownRight className='h-4 w-4 mr-1 text-red-500' />
                            Expense
                        </div>
                    </CardFooter>
                </Link>
            </Card>


        </div>
    )
}

export default AccountCard