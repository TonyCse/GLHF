'use client';

import Link from 'next/link';

export default function NotFound() {

    return (
        <div className="flex flex-col items-center justify-center bg-[#232426] text-white">
            <h1 className="text-9xl font-bold text-[#8F60D0]">404</h1>
            <p className="text-lg text-gray-300 mb-6">Oops ! Tu t&apos;es perdu dans la faille de l&apos;invocateur</p>


            <Link href="/">
                <button className="mt-6 px-6 py-3 bg-[#8F60D0] text-white font-semibold rounded-md hover:bg-[#754bb2] transition">
                    Retour à l&apos;accueil
                </button>
            </Link>
        </div>
    );
}
