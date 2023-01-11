const TextBox = ({
    label,
    defaultText,
    id,
    elemntClass,
    name,
}) => {
    return(
        <div>
            <label htmlFor={name}>{label}</label>
            <input className={elemntClass} type="text" id={id} name={name} placeholder={defaultText}></input>
        </div>
    )
}

export default TextBox