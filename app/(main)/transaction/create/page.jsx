import React from 'react'
import { getUserAccounts } from '@/actions/dashboard'
import { defaultCategories } from '@/data/categories';
import AddTransactionForm from '@/app/(main)/transaction/_components/transaction-add';
import { getTransaction } from '@/actions/transaction';

const AddTransactionPage = async ({ searchParams }) => {
    const accounts = await getUserAccounts();
    const editId = await searchParams?.edit;
    let initialData = null;
    if (editId) {
        const transaction = await getTransaction(editId);
        initialData = transaction;
    }
    return (
        <div className='max-w-3xl mx-auto px-5'>
            <h1 className='text-5xl gradient-title mb-8'>
                {editId ? "Edit Transaction" : "Add Transaction"}
            </h1>
            <AddTransactionForm
                accounts={accounts}
                categories={defaultCategories}
                editMode={!!editId}
                initialData={initialData}
            />


        </div>
    )
}

export default AddTransactionPage