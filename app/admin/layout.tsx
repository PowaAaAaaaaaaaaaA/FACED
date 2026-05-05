'use client';
import React from "react";
import { PiCards } from "react-icons/pi";
import { BsPersonFill } from "react-icons/bs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', icon: <PiCards className="text-2xl" />, label: 'FACED Cards' },
    { href: '/admin/AdminPages/BeneficiaryPage', icon: <BsPersonFill className="text-2xl" />, label: 'Beneficiaries' },
  ];

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <label htmlFor="my-drawer-3" className="btn drawer-button lg:hidden m-2 self-start">
          Open drawer
        </label>
        {children}
      </div>
      <div className="drawer-side bg-[#0D1B4B]">
        <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu min-h-full w-80 p-4 flex flex-col gap-10 bg-[#0D1B4B] text-white">
          <div className="border-b-2 border-gray-600 p-5">
            <h1 className="text-[1.5rem] text-white">FACED System</h1>
            <p className="text-[0.6rem]">DIGITAL PLATFORM</p>
          </div>
          <div className="gap-2 flex flex-col">
            <label className="text-[#A1A1A1] text-xs font-bold font-condensed">OVERVIEW</label>
            {navItems.map(({ href, icon, label }) => (
              <li
                key={href}
                className={`rounded-[5px] ${
                  pathname === href ? 'bg-[#D40465]' : 'hover:bg-[#ff7eba]'
                }`}
              >
                <Link href={href} className="font-bold">{icon} {label}</Link>
              </li>
            ))}
          </div>
        </ul>
      </div>
    </div>
  );
}