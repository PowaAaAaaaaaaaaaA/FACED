"use client"
import React from 'react'
import { useState } from 'react'
import { LucidePlus, Trash2 } from 'lucide-react'

export type AssistanceFields = {
  id: number
  dateA: string
  fullName: string
  emergencydisaster: string
  assistance: string
  unit: string
  qty: string
  cost: string
  providers: string
}

function AssistanceRecord() {
  const [assistance, setAssistance] = useState<AssistanceFields[]>([
    {
      id: 1,
      dateA: '',
      fullName: '',
      emergencydisaster: '',
      assistance: '',
      unit: '',
      qty: '',
      cost: '',
      providers: ''
    }
  ])

  const addAssistance = () => {
    setAssistance((prev) => [
      ...prev,
      {
        id: Date.now(),
        dateA: '',
        fullName: '',
        emergencydisaster: '',
        assistance: '',
        unit: '',
        qty: '',
        cost: '',
        providers: ''
      }
    ])

    console.log('Added record')
  }

  const deleteAssistance = (id: number) => {
    if (assistance.length === 1) return
    setAssistance((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className='h-full w-full p-2'>
      <h2 className='rounded-lg text-[0.9rem] w-[30%] p-1 text-center font-bold text-[#0F2F9A] bg-[#D5EDFF]'>
        ASSISTANCE RECORDS
      </h2>

      <form>
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
          <table className="table table-xs">
            <thead>
              <tr>
                <th>DATE</th>
                <th>RECEIVER</th>
                <th>EMERGENCY/DISASTER</th>
                <th>ASSISTANCE</th>
                <th>UNIT</th>
                <th>QTY</th>
                <th>COST</th>
                <th>PROVIDER</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {assistance.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input type="date" className="input input-xs" />
                  </td>

                  <td>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      className="input input-xs"
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      placeholder="Type here"
                      className="input input-xs"
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      placeholder="Type here"
                      className="input input-xs"
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      placeholder="Type here"
                      className="input input-xs"
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      placeholder="Type here"
                      className="input input-xs"
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      placeholder="Type here"
                      className="input input-xs"
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      placeholder="Type here"
                      className="input input-xs"
                    />
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-square btn-sm btn-ghost text-red-500"
                      onClick={() => deleteAssistance(item.id)}
                      disabled={assistance.length === 1}
                      title={assistance.length === 1 ? 'At least one record required' : 'Remove'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-3">
          <button
            type="button"
            className="btn btn-soft btn-secondary border border-secondary btn-dash btn-sm w-full"
            onClick={addAssistance}
          >
            <LucidePlus size={16} />
            Add Record
          </button>
        </div>
      </form>
    </div>
  )
}

export default AssistanceRecord