import React from 'react'
import { useFacedStore } from '@/app/store/useFacedStore'
import { BiErrorCircle } from "react-icons/bi";

function CardInfo() {
  const selectedCard = useFacedStore((s) => s.selectedCard);

  console.log(selectedCard, "haha")

  if (!selectedCard){
    return(
      <div className='h-full w-full p-2 flex justify-center items-center mt-10 gap-5 text-2xl text-gray-400'> 
        <BiErrorCircle />
        <h1>Please Select a FACED Card to view the details</h1>
      </div>

    )
  }

  return (
    <div className='w-full p-2 overflow-auto'>
      <div>
        <h2 className='rounded-2xl text-[0.9rem] w-[15%] p-1 text-center font-bold text-[#0F2F9A] bg-[#D5EDFF]'>LOCATION</h2>

        <div className='grid grid-cols-3 p-1 w-full mt-2'>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>REGION</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.region}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>PROVINCE</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.province}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>CITY / MUNICIPALITY</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.municipality}</p>
          </div>
        </div>

        <div className='grid grid-cols-3 p-1 w-full'>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>DISTRICT</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.district}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>BARANGAY</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.barangay}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>EVACUATION CENTER</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.evacuation_center_site}</p>
          </div>
        </div>
      </div>
            <div className='mt-2'>
        <h2 className='rounded-2xl w-[24%] p-1 text-center font-bold text-[#0F2F9A] bg-[#D5EDFF] text-[0.9rem]'>HEAD OF FAMILY</h2>

        <div className='grid grid-cols-4 p-1 w-full mt-2'>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>LAST NAME</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.last_name}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>FIRST NAME</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.first_name}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>MIDDLE NAME</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.middle_name}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>BIRTHDATE</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.birthdate}</p>
          </div>
        </div>

        <div className='grid grid-cols-4 p-1 w-full'>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>AGE</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.age}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>SEX</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.sex}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>CIVIL STATUS</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.civil_status}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>RELIGION</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.religion}</p>
          </div>
        </div>
        <div className='grid grid-cols-4 p-1 w-full'>

          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>OCCUPATION</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.occupation}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>MONTHLY INCOME</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.monthly_family_net_income}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>ID PRESENTED</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.id_card_presented}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>ID NUMBER</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.id_card_number}</p>
          </div>
        </div>
          <div className='grid grid-cols-2 p-1 w-full'>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>CONTACT NO.</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.contact_primary}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>ALTERNATE NO.</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.contact_alternate}</p>
          </div>
        </div>
      </div>
            <div className='mt-2'>
        <h2 className='rounded-2xl w-[33%] p-1 text-center font-bold text-[#0F2F9A] bg-[#D5EDFF] text-[0.9rem]'>ACCOUNT INFORMATION</h2>

        <div className='grid grid-cols-3 p-1 w-full mt-2'>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>BANK / E-WALLET</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>
  {selectedCard?.ewallet_name ? selectedCard.ewallet_name : selectedCard?.bank_name}
</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>ACCOUNT NAME</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.account_name}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>ACCOUNT TYPE</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.account_type}</p>
          </div>
        </div>

        <div className='grid grid-cols-3 p-1 w-full'>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>ACCOUNT NUMBER</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.account_number}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>HOUSE OWNERSHIP</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.house_ownership}</p>
          </div>
          <div>
            <p className='text-gray-500 text-[0.7rem] font-bold'>SHELTER DAMAGE</p>
            <p className='text-[0.8rem] text-[#0D1B4B] font-bold'>{selectedCard?.shelter_damage}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardInfo