import React from 'react'
import { useFacedStore } from '@/app/store/useFacedStore';

function FamilyMembers() {
  const selectedCard = useFacedStore((s) => s.selectedCard);

  return (
    <div className='h-full w-full p-2'>
      <div>
        <h2 className='rounded-2xl w-[15%] p-1 text-center font-bold text-[#0F2F9A] bg-[#D5EDFF]'>Location</h2>

        <div className='grid grid-cols-3 p-1 w-full mt-2'>
          <div>
            <h3 className='text-gray-500 font-bold'>REGION</h3>
            <p className='text-[1rem] text-[#0D1B4B] font-bold'>{selectedCard?.region}</p>
          </div>
          <div>
            <h3 className='text-gray-500 font-bold'>PROVINCE</h3>
            <p className='text-[1rem] text-[#0D1B4B] font-bold'>{selectedCard?.province}</p>
          </div>
          <div>
            <h3 className='text-gray-500 font-bold'>CITY / MUNICIPALITY</h3>
            <p className='text-[1rem] text-[#0D1B4B] font-bold'>{selectedCard?.municipality}</p>
          </div>
        </div>

        <div className='grid grid-cols-3 p-1 w-full'>
          <div>
            <h3 className='text-gray-500 font-bold'>DISTRICT</h3>
            <p className='text-[1rem] text-[#0D1B4B] font-bold'>{selectedCard?.district}</p>
          </div>
          <div>
            <h3 className='text-gray-500 font-bold'>BARANGAY</h3>
            <p className='text-[1rem] text-[#0D1B4B] font-bold'>{selectedCard?.barangay}</p>
          </div>
          <div>
            <h3 className='text-gray-500 font-bold'>EVACUATION CENTER</h3>
            <p className='text-[1rem] text-[#0D1B4B] font-bold'>{selectedCard?.evacuation_center_site}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FamilyMembers