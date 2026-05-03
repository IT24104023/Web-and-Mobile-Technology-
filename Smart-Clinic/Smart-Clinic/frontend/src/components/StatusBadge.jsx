import React from 'react'
import PropTypes from 'prop-types'

const badgeClass = {
  PENDING:    'badge-pending',
  PAID:       'badge-paid',
  PROCESSING: 'badge-processing',
  DISPATCHED: 'badge-dispatched',
  DELIVERED:  'badge-delivered',
  CANCELLED:  'badge-cancelled',
  UNPAID:     'badge-unpaid',
  REFUNDED:   'badge-refunded',
  SUCCESS:    'badge-success',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${badgeClass[status?.toUpperCase()] || 'badge-pending'}`}>
      {status}
    </span>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.string,
}
