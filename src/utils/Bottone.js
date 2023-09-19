'use client'
import {ReactElement as Loader} from "../../icons/loader.svg"

const Bottone = ({ onSubmit, text, loading = false}) => {
  return (
    <button className="submit-btn" onClick={onSubmit}>
      {!loading ? text : 'diostracanebastardo'}
    </button>
  )
}
  
export default Bottone