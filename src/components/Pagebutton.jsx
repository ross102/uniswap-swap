import React from 'react';


const Pagebutton = (props) => {
    return (
        <div className='btn'>
            <span className={props.isBold ? "pageButtonBold hoverBold" : "hoverBold"}>
                {props.name}
            </span>
        </div>
    )
}

export default Pagebutton;