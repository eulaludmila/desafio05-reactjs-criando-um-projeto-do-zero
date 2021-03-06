import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export default function formatDateBrasilian(date){
  return format(
    new Date(date),
    "dd MMM yyyy",
    {
      locale: ptBR,
    }
  )
}

export function formatDateandHourBrasilian(date){
  return format(
    new Date(date),
    "dd MMM yyyy, 'às' HH:mm",
    {
      locale: ptBR,
    }
  )
}