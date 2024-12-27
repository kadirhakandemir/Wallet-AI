"use client"
import React, { useEffect, useMemo, useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"


import { Checkbox } from '@/components/ui/checkbox'
import { format, set } from 'date-fns'
import { categoryColors } from '@/data/categories'
import { Badge } from '@/components/ui/badge'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChevronUp, ChevronDown, Clock, MoreHorizontal, RefreshCw, Search, Trash, X } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/use-fetch'
import { BarLoader } from 'react-spinners'
import { bulkDeleteTransactions } from '@/actions/account'
import { toast } from 'sonner'


const RECURRING_INTERVALS = {
    "DAILY": "Daily",
    "WEEKLY": "Weekly",
    "MONTHLY": "Monthly",
    "YEARLY": "Yearly",
};

const TransactionTable = ({ transactions }) => {
    const router = useRouter();


    const [selectedIds, setSelectedIds] = useState([]);
    const [sortConfig, setSortConfig] = useState({ field: "date", direction: "desc" });
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [recurringFilter, setRecurringFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);


    const {
        loading: deleteLoading,
        fn: deleteFn,
        data: deleted,
    } = useFetch(bulkDeleteTransactions);

    const handleBulkDelete = async () => {
        if (
            !window.confirm(
                `Are you sure you want to delete ${selectedIds.length} transactions?`
            )
        )
            return;

        deleteFn(selectedIds);
    };
    useEffect(() => {
        if (deleted && !deleteLoading) {
            toast.error("Transactions deleted successfully");
        }
    }, [deleted, deleteLoading]);


    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter((transaction) =>
                transaction.description?.toLowerCase().includes(searchLower)
            );
        }
        if (recurringFilter) {
            result = result.filter((transaction) => {
                if (recurringFilter === "recurring") return transaction.isRecurring;
                return !transaction.isRecurring;
            });
        }
        if (typeFilter) {
            result = result.filter((transaction) => transaction.type === typeFilter);
        }
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortConfig.field) {
                case "date":
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case "amount":
                    comparison = a.amount - b.amount;
                    break;
                case "category":
                    comparison = a.category.localeCompare(b.category);
                    break;
                default:
                    comparison = 0;
            }
            return sortConfig.direction === "asc" ? comparison : -comparison;
        })
        return result;
    }, [transactions, sortConfig, searchTerm, typeFilter, recurringFilter]);

    const paginatedTransactions = filteredAndSortedTransactions.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );
    const totalPages = Math.ceil(transactions.length / pageSize);
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };



    const handleSort = (field) => {
        setSortConfig(current => ({
            field,
            direction:
                current.field == field && current.direction === "asc" ? "desc" : "asc",
        }));
    };

    const handleSelect = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        })
    }

    const handleSelectAll = () => {
        if (selectedIds.length === transactions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(transactions.map(transaction => transaction.id));
        }
    }
    const handleClearFilters = () => {
        setSearchTerm("");
        setTypeFilter("");
        setRecurringFilter("");
        setSelectedIds([]);

    }

    return (
        <div className='space-y-4'>
            {deleteLoading && (
                <BarLoader className='mt-4' width={"100%"} color='#9333ea' />
            )}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative flex-1'>
                    <Search className='absolute top-2.5 left-2 h-4 w-4 text-muted-foreground' />
                    <Input className='pl-8' placeholder='Search...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className='flex gap-2'>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={recurringFilter} onValueChange={(value) => setRecurringFilter(value)}>
                        <SelectTrigger className='w-[140px]'>
                            <SelectValue placeholder="All Transactions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recurring">Recurring Only</SelectItem>
                            <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
                        </SelectContent>
                    </Select>
                    {selectedIds.length > 0 && (
                        <div className='flex gap-2 items-center'>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                            >
                                <Trash className='h-4 w-4 mr-2' />
                                Delete Selected ({selectedIds.length})
                            </Button>
                        </div>
                    )}
                    {(searchTerm || typeFilter || recurringFilter) && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleClearFilters}
                            title="Clear Filters"
                        >
                            <X className='h-4 w-5' />
                        </Button>
                    )}
                </div>
            </div>
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox checked={selectedIds.length === transactions.length} onCheckedChange={handleSelectAll} />
                            </TableHead>
                            <TableHead
                                onClick={() => handleSort("date")}
                                className="cursor-pointer">
                                <div className="flex items-center">Date {" "}
                                    {sortConfig.field === "date" && (
                                        sortConfig.direction === "asc" ? <ChevronUp className='ml-1 h-4 w-4' /> : <ChevronDown className='ml-1 h-4 w-4' />
                                    )}</div>
                            </TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead
                                onClick={() => handleSort("category")}
                                className="cursor-pointer">
                                <div className="flex items-center">Category {" "}
                                    {sortConfig.field === "category" && (
                                        sortConfig.direction === "asc" ? <ChevronUp className='ml-1 h-4 w-4' /> : <ChevronDown className='ml-1 h-4 w-4' />
                                    )}</div>
                            </TableHead>
                            <TableHead
                                onClick={() => handleSort("amount")}
                                className="cursor-pointer">
                                <div className="flex items-center justify-end">Amount {" "}
                                    {sortConfig.field === "amount" && (
                                        sortConfig.direction === "asc" ? <ChevronUp className='ml-1 h-4 w-4' /> : <ChevronDown className='ml-1 h-4 w-4' />
                                    )}</div>
                            </TableHead>
                            <TableHead>Recurring</TableHead>
                            <TableHead className="w-[50px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No Transactions Found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>
                                        <Checkbox checked={selectedIds.includes(transaction.id)} onCheckedChange={() => handleSelect(transaction.id)} />
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(transaction.date), "PP")}
                                    </TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell className="capitalize">
                                        <span style={{
                                            background: categoryColors[transaction.category],
                                        }} className='px-2 py-1 rounded text-white text-sm'>{transaction.category}</span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium" style={{ color: transaction.type === "EXPENSE" ? "red" : "green" }}>
                                        {transaction.type === "EXPENSE" ? "-" : "+"}
                                        ${transaction.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>{transaction.isRecurring ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
                                                        <RefreshCw className='h-3 w-3' />
                                                        {RECURRING_INTERVALS[transaction.recurringInterval]}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className='text-sm'>
                                                        <div className='font-medium'>Next Date:</div>
                                                        <div>
                                                            {format(new Date(transaction.nextRecurringDate), "PP")}
                                                        </div>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    ) : (
                                        <Badge variant="outline" className="gap-1">
                                            <Clock className='h-3 w-3' />
                                            One-time
                                        </Badge>
                                    )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button className='h-8 w-8 p-0' variant="ghost">
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    className='cursor-pointer'
                                                    onClick={() =>
                                                        router.push(`/transaction/create?edit=${transaction.id}`)
                                                    }
                                                >Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className=' cursor-pointer text-destructive'
                                                    onClick={() => deleteFn([transaction.id])}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious className="cursor-pointer" disabled={currentPage === 1} onClick={goToPreviousPage} />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink className="cursor-pointer" clickable="true" onClick={goToPreviousPage} >
                                {currentPage === 1 ? null : currentPage - 1}
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink className="cursor-pointer" isActive onClick={() => setCurrentPage(currentPage)} >
                                {currentPage}
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink className="cursor-pointer" clickable="true" onClick={goToNextPage} >{currentPage === totalPages ? null : currentPage + 1}</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext className="cursor-pointer" disabled={currentPage === totalPages}
                                onClick={goToNextPage} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}
export default TransactionTable