import React from 'react';
import Pagebutton from './Pagebutton';


const Connectbutton = (props) => {
    const { isConnected, getSigner, signerAddress, provider } = props
    const displayAddress = `${signerAddress?.substring(0, 10)}...`
    return (
        <>
            {isConnected ? (
                <div>
                    <Pagebutton name={displayAddress} />
                </div>
            ) :
                <div
                    className='btn my-2 connectButton'
                    onClick={() => getSigner(provider)}
                >
                    Connect wallet
                </div>
            }
        </>
    )
}

export default Connectbutton;