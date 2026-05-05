// app/admin/layout.tsx
import React from "react";
import { PiCards } from "react-icons/pi";
import { BsPersonFill } from "react-icons/bs";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <label htmlFor="my-drawer-3" className="btn drawer-button lg:hidden m-2 self-start">
          Open drawer
        </label>
        {children}  {/* page content renders here */}
      </div>
      <div className="drawer-side bg-[#0D1B4B]">
        <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu min-h-full w-80 p-4 flex flex-col gap-10 bg-[#0D1B4B] text-white">
          <div className="border-b-2 border-gray-600 p-5">
            <h1 className="text-[1.5rem] text-white">FACED System</h1>
            <p className="text-[0.6rem]">DIGITAL PLATFORM</p>
          </div>
          <div className="gap-2 flex flex-col">
            <label>OverView</label>
            <li className="hover:bg-amber-400 rounded-[5px]">
              <Link href="/admin"><PiCards className="text-2xl" /> FACED Cards</Link>
            </li>
            <li className="hover:bg-amber-400 rounded-[5px]">
              <Link href="/admin/AdminPages/BeneficiaryPage"><BsPersonFill className="text-2xl" /> Beneficiaries</Link>
            </li>
          </div>
        </ul>
      </div>
    </div>
  );
}