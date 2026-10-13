const Input = ({ label, placeholder }) => {
  return (
    <div>
      <label htmlFor="input">{label}</label>
      <input type="text" id="input" placeholder={placeholder} />
    </div>
  )
}

export default Input;