import { health_check_appointment } from '@prisma/client';

export function getAppointmentStatus(appointment: health_check_appointment) {
  if (appointment.fee_paid === true) return 'PAIDED';
  if (appointment.finished) return 'DONE';
  if (!!appointment.doctor_id) return 'CHECKING';
  return 'REQUESTING';
}
