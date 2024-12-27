import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const NotFound = () => {
    return (
        <div>
            <h1 className='text-6xl font-bold gradient-title mb-4'>404</h1>
            <h2 className='text-2xl font-semibold mb-4'>Page Not Found</h2>
            <p className='text-gray-600 mb-8'>Oops! The page you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link href={'/'}>
                <Button>Go Home</Button>
            </Link>
        </div>
    )
}

export default NotFound