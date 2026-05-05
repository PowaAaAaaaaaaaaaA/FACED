import React from 'react'

function SegmentedButtons() {
  return (
    <div className="join bg-gray-200 rounded-2xl gap-2">
  <input className="join-item btn rounded-2xl" type="radio" name="options" aria-label="Card Records" defaultChecked />
  <input className="join-item btn rounded-2xl" type="radio" name="options" aria-label="Print to PDF" />
</div>
  )
}

export default SegmentedButtons