import React from 'react'

class Modal extends React.Component {

    render() {
        return (
            <div className={`flex flex-col justify-center place-items-center fixed inset-0 transition-opacity duration-300 ease-in-out z-50 ${this.props.isOpen ? '' : 'pointer-events-none'}`}>
                <div className={`fixed inset-0 bg-black ${this.props.isOpen ? 'opacity-50' : 'pointer-events-none opacity-0'}`} 
                     onClick={this.props.onClose} 
                />
    
                <div className={`fixed mobile:w-72 w-96 h-auto px-2 py-12 bg-white rounded-bl-2xl rounded-tr-2xl border-2 border-gray-500 shadow-2xl transition-opacity duration-300 ease-in-out ${this.props.isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                    { this.props.children }
                </div>
            </div>
        )
    }
}

export default Modal;