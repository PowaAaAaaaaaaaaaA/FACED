import React from 'react'
import { useFacedStore } from '@/app/store/useFacedStore';

function FamilyMembers() {
  const selectedCard = useFacedStore((s) => s.selectedCard);

  if (!selectedCard) return null;

  const calculateAge = (birthdate: string) => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }); // e.g. 05-Jun-1982
  };

  return (
    <div className='h-full w-full p-2'>
      <div className="mb-3">
        <span className="bg-blue-100 text-blue-700 font-semibold text-sm px-3 py-1 rounded">
          FAMILY MEMBERS
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase">
              <th>Name</th>
              <th>Relation</th>
              <th>Birthdate</th>
              <th>Age</th>
              <th>Sex</th>
              <th>Education</th>
              <th>Occupation</th>
              <th>Vulnerability</th>
            </tr>
          </thead>
          <tbody>
            {selectedCard.family_members.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-4">
                  No family members recorded.
                </td>
              </tr>
            ) : (
              selectedCard.family_members.map((member) => (
                <tr key={member.id}>
                  <td className="font-medium">{member.full_name}</td>
                  <td>{member.relation_to_head}</td>
                  <td>{member.birthdate ? formatDate(member.birthdate) : "—"}</td>
                  <td>{member.birthdate ? calculateAge(member.birthdate) : "—"}</td>
                  <td>{member.sex}</td>
                  <td>{member.highest_educational_attainment || "—"}</td>
                  <td>{member.occupation || "—"}</td>
                  <td>{member.type_of_vulnerability || "None"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FamilyMembers;