import React from 'react'
import Web3 from 'web3'
import Modal from './modal.js'
import { getRNBContract, getUpCoomingContract } from '../web3-min.js'
import CircleProgressBar from './circleProgressBar'
import { useToasts } from 'react-toast-notifications'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import BackgroundImage from '../assets/background.jpg'
import LeftTopImage from '../assets/image/left-top_img.svg'
import LeftBottomImage from '../assets/image/left-bottom_img.svg'
import RightTopImage from '../assets/image/right-top_img.svg'
import RightBottomImage from '../assets/image/right-bottom_img.svg'
import LeftBottomButton from '../assets/image/left-bottom_button.svg'
import BalanceImage from '../assets/image/balance_img.svg'
import BettedImage from '../assets/image/betted_img.svg'
import CurrentImage from '../assets/image/current_img.svg'
import HistoricalImage from '../assets/image/historical_img.svg'

function withToast(Component) {
    return function WrappedComponent(props) {
        const toastFuncs = useToasts()
        return(
            <Component {...props} {...toastFuncs} />
        )
    }
}

const decimal = 1e4
class Home extends React.Component {

    constructor() {
        super()

        this.state = {
            totalDay: 6,
            timeInfo: {
                remainDays: 0,
                remainHours: 0,
                remainMinutes: 0,
                remainSeconds: 0,
            },
            betInfo: {
                current: 0,
                historical: 0,
                bettedAmount: 0,
                selectedNumber: 0,
                selectedAmount: 0,
                endTimeOfCurrentBetting: 0,
            },
            walletInfo: {
                address: '',
                balance: 0,
            },
            glassPatternInfo: {
                glassButtonState: [-1, -1, -1, -1, -1, -1],
                paddingTopOfGlass: '48vh',
                heightOfGlass: '230px',
                widthOfGlassButton: '145px'
            },
            bettingState: 0,
            backgroundURL: './glass_combinations/Background.jpg',
            isModalOpen: false,
        }

        this.wrapper = React.createRef()
        this.textInput = React.createRef()

        this.bet = this.bet.bind(this)
        this.getDiff = this.getDiff.bind(this)
        this.getUPCBalance = this.getUPCBalance.bind(this)
        this.updateAllState = this.updateAllState.bind(this)
        this.updateEndTime = this.updateEndTime.bind(this)
        this.connectWallet = this.connectWallet.bind(this)
        this.countdownClock = this.countdownClock.bind(this)
        this.updateDimensions = this.updateDimensions.bind(this)
        this.updateBettingData = this.updateBettingData.bind(this)
        this.sendCryptoToContract = this.sendCryptoToContract.bind(this)
        this.updateBettingState = this.updateBettingState.bind(this)
        this.scanConnectedWallet = this.scanConnectedWallet.bind(this)
        this.changeGlassButtonState = this.changeGlassButtonState.bind(this)

        this.checkChainId = this.checkChainId.bind(this)
        this.checkPatternState = this.checkPatternState.bind(this)
        this.checkWalletConnection = this.checkWalletConnection.bind(this)
        this.checkBettingState = this.checkBettingState.bind(this)

        setTimeout(this.updateAllState, 2000)
    }

    convertAddresstoName(address) {
        const len = address.length
        return address.slice(0, 4) + '...' + address.slice(len - 4, len)
    }

    async connectWallet() {
        if(this.state.walletInfo.address !== '') return;

        if(window.ethereum) {
            let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            this.setState({
                ...this.state,
                walletInfo: {
                    ...this.state.walletInfo,
                    address: accounts[0]
                }
            });
        } else {
            alert('Please install metamask extension.')
        }
    }

    async displayNotification(appearance, text) {
        switch(appearance) {
            case 'warning':
                toast.warn(text)
                break
            case 'info':
                toast.info(text)
                break
            case 'error':
                toast.error(text)
                break
            case 'success':
                toast.success(text, {
                    position: toast.POSITION.TOP_CENTER
                })
                break
            default:
                break
        }
    }

    async checkChainId() {
        /*let chainId = '0x38'
        let currentChainId = await window.ethereum.request({ method: 'eth_chainId' }); // rop-3 bsc-test-61 bsc-main-38

        console.log(currentChainId)
        if(chainId !== currentChainId) {
            return false
        }

        return true;*/
        return true
    }

    checkWalletConnection() {
        if(this.state.walletInfo.address === '') {
            return false
        }
        return true
    }

    checkBettingState() {
        if(this.state.bettingState === 0) {
            this.displayNotification('info', 'Betting not started yet.')
            return false
        }
        if(this.state.bettingState === 1) {
            let dif = this.getDiff(this.state.betInfo.endTimeOfCurrentBetting)

            if(dif <= 0) {
                this.displayNotification('info', "Betting stopped.")
                return false
            }
        }
        if(this.state.bettingState === 2) {
            this.displayNotification('info', 'Betting stopped.')
            return false
        }

        return true
    }
    
    checkPatternState() {
        for(let i = 0; i < 6; i ++) {
            if(this.state.glassPatternInfo.glassButtonState[i] === -1) {
                this.displayNotification('warning', 'Please select number you are going to bet.')
                return false
            }
        }
        return true
    }

    async bet() {
        if(!this.checkWalletConnection()) {
            this.displayNotification('info', 'Please connect to metamask.')
            return
        }
        if(!this.checkChainId()) {
            this.displayNotification('warning', 'Please change network to binance mainnet.')
            return
        }
        
        if(this.state.bettingState === 2) {
            const { contract, contractAddress } = getRNBContract()

            let amount = await contract.methods.getAmountWithdrawable().call({
                from: this.state.walletInfo.address,
                to: contractAddress
            })

            amount = parseInt(amount)

            if(amount === 0) {
                this.displayNotification('warning', `You have zero balance.`)
                return
            }

            contract.methods.claimReward().send({
                from: this.state.walletInfo.address,
                to: contractAddress
            }).then(() => {
                this.displayNotification('success', `You received ${amount * 1.0 / decimal} UPC.`)
            }).catch(() => {
                this.displayNotification('warning', `Transaction failed.`)
            })
        }
        else {
            if(this.checkBettingState() === false) {
                return
            }
            if(this.checkPatternState() === false) {
                return
            }

            let selectedNumber = 0
            for(let i = 0; i < 6; i ++) {
                if(i % 2 && this.state.glassPatternInfo.glassButtonState[i]) {
                    selectedNumber += Math.pow(2, Math.floor(i / 2))
                }
            }

            this.setState({
                ...this.state,
                isModalOpen: true,
                betInfo: {
                    ...this.state.betInfo,
                    selectedNumber,
                }
            })
            this.textInput.current.focus()
            this.textInput.current.value = "";
        }
    }

    async sendCryptoToContract() {
        if(this.state.betInfo.selectedAmount <= 0 || isNaN(this.state.betInfo.selectedAmount)) {
            this.displayNotification('warning', 'Please input correct amount.')
        }
        else {
            let bettedAmount
            bettedAmount = parseInt(this.state.betInfo.selectedAmount) * decimal;

			let upc = getUpCoomingContract()
            const { contract, contractAddress } = getRNBContract();

            upc.methods.approve(contractAddress, bettedAmount).send({
				from: this.state.walletInfo.address
			}).then(() => {
				contract.methods.bet(this.state.betInfo.selectedNumber, bettedAmount).send({
					from: this.state.walletInfo.address,
					to: contractAddress,
				}).then(() => {
                    this.displayNotification('success', `You betted ${bettedAmount / decimal} UPC.`)
				}).catch(() => {
                    this.displayNotification('error', `Transaction failed.`)
                })
			})
        }
    }

    async changeGlassButtonState(id) {
        if(!this.checkWalletConnection()) {
            this.displayNotification('info', 'Please connect to metamask.')
            return
        }
        if(!this.checkChainId()) {
            this.displayNotification('warning', 'Please change network to binance mainnet.')
            return
        }
        if(this.checkBettingState() === false) {
            return
        }

        let glassButtonId = parseInt(id)
    
        let glassButtonState = [], backgroundURL = "./glass_combinations/"
        glassButtonState = this.state.glassPatternInfo.glassButtonState;    
        for(let i = 0; i < glassButtonId; i ++) {
            if(glassButtonId % 2 && glassButtonId === i + 1) {
                continue
            }
            if(glassButtonState[i] === -1) {
                this.displayNotification('warning', 'Please select correct number.')
                return;
            }
        }

        if(glassButtonId % 2) {
            glassButtonState[glassButtonId - 1] = 0
        } else {
            glassButtonState[glassButtonId + 1] = 0
        }
        glassButtonState[glassButtonId] = 1

        for(let i = 0; i < glassButtonState.length; i ++) {
            if(glassButtonState[i] === 1) {
                if(i % 2 === 0) {
                    backgroundURL += 'Left_'
                } else {
                    backgroundURL += 'Right_'
                }
            }
        }

        backgroundURL = backgroundURL.slice(0, backgroundURL.length - 1) + '.jpg'
        const img = new Image()
        img.src = backgroundURL
        img.onload = () => {
            this.setState({
                ...this.state,
                glassPatternInfo: {
                    ...this.state.glassPatternInfo,
                    glassButtonState
                },
                backgroundURL,
            })
        };
    }

    getUPCBalance() {
        let upc = getUpCoomingContract()
        upc.methods.balanceOf(this.state.walletInfo.address).call()
        .then((result) => {
            let balance
            balance = (result / decimal).toFixed(2)
            this.setState({
                ...this.state,
                walletInfo: {
                    ...this.state.walletInfo,
                    balance
                }
            })
        })
    }

    scanConnectedWallet() {
        const web3 = new Web3(window.ethereum);

        web3.eth.getAccounts(async (err, accounts) => {
            let address = '';

            if(err === null && accounts.length > 0) {
                address = accounts[0]
                this.setState({
                    ...this.state,
                    walletInfo: {
                        ...this.state.walletInfo,
                        address
                    }
                }, () => {
                    this.getUPCBalance()
                });
            }
        });
    }

    async updateBettingState() {
        const { contract } = getRNBContract();
        let state = await contract.methods.getBettingState().call()
        let betState = parseInt(state)
        this.setState({
            ...this.state,
            bettingState: betState
        })
    }

    updateBettingData() {
        const { contract } = getRNBContract();
        if(this.state.bettingState === 1) {
            contract.methods.getBettingData().call()
            .then(res => {
                this.setState({
                    ...this.state,
                    betInfo: {
                        ...this.state.betInfo,
                        current: res[0],
                        historical: res[1],
                        bettedAmount: (parseFloat(res[2]) / decimal).toFixed(2),
                    }
                })
            })
        }

        this.getUPCBalance()
    }

    getDiff(timestamp) {
        let currentTime = new Date()
        let currentTimestamp = currentTime.getTime() / 1000 //+ currentTime.getTimezoneOffset() * 60
        return timestamp - currentTimestamp
    }

    async updateEndTime() {
        const { contract } = getRNBContract();
        
        if(this.state.bettingState === 1) {
            contract.methods.getEndTime().call()
            .then(async (timestamp) => {
                let dif = this.getDiff(timestamp)
                let totalDay = parseInt(await contract.methods.getDurationOfBetting().call()) / (24 * 3600)

                if(dif <= 0) {
                    return
                }

                this.setState({
                    ...this.state,
                    betInfo: {
                        ...this.state.betInfo,
                        endTimeOfCurrentBetting: timestamp
                    },
                    totalDay
                }, () => {
                    this.countdownClock()
                })
            })
        }
    }

    countdownClock() {
        clearInterval(this.timeId1)

        this.timeId1 = setInterval(() => {
            let dif = this.getDiff(this.state.betInfo.endTimeOfCurrentBetting)
            if(dif < 0) {
                // this.setState({
                //     ...this.state,
                //     bettingState: 2
                // })
                return
            }

            this.setState({
                ...this.state,
                timeInfo: {
                    remainDays: parseInt(dif / (24 * 3600)),
                    remainHours: parseInt((dif % (24 * 3600)) / 3600),
                    remainMinutes: parseInt(((dif % (24 * 3600)) % 3600) / 60),
                    remainSeconds: parseInt(((dif % (24 * 3600)) % 3600) % 60),
                }
            })
        }, 1000)
    }

    updateDimensions() {
        let width, height
        width = window.innerWidth
        height = window.innerHeight

        if(width >= 915) {
            if(width / height > 1366 / 768) {
                this.setState({
                    ...this.state,
                    glassPatternInfo: {
                        ...this.state.glassPatternInfo,
                        heightOfGlass: 230 * (width / 1366) + 'px',
                        paddingTopOfGlass: 370 * (width / 1366) + 'px',
                        widthOfGlassButton: 144 * (width / 1366) + 'px',
                    }
                })
            } else {
                this.setState({
                    ...this.state,
                    glassPatternInfo: {
                        ...this.state.glassPatternInfo,
                        heightOfGlass: 230 * (height / 768) + 'px',
                        paddingTopOfGlass: '48vh',
                        widthOfGlassButton: 144 * (height / 768) + 'px',
                    }
                })
            }
        } else {
            this.setState({
                ...this.state,
                glassPatternInfo: {
                    ...this.state.glassPatternInfo,
                    heightOfGlass: 148 * (height / 657) + 'px',
                    paddingTopOfGlass: 327 * (height / 657) + 'px',
                    widthOfGlassButton: 99 * (height / 657) + 'px'
                }
            })
        }
    }

    async updateAllState() {
        if(!(this.checkWalletConnection() && this.checkChainId())) {
            return
        }

        await this.updateBettingState()
        this.updateBettingData()
        this.updateEndTime()
    }

    componentDidMount() {
        this.updateDimensions()
        if(window.ethereum) {
            this.scanConnectedWallet()
        }

        this.timeId2 = setInterval(async () => {
            await this.updateAllState()
        }, 30000)

        window.addEventListener('resize', this.updateDimensions);

        if(window.ethereum) {
            window.ethereum.on('disconnect', () => { 
                window.location.reload();
            });
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            })
            window.ethereum.on('accountsChanged', () => {
                window.location.reload();
            })
        }
    }

    componentWillUnmount() {
        clearInterval(this.timeId1)
        clearInterval(this.timeId2)
    }

    render() {
        return (
            <div ref={this.wrapper} className='overflow-hidden'>
                <ToastContainer />
                {/* This is design for web */}
                <div className='hidden laptop:block'>
                    <div className="w-screen h-screen bg-black flex flex-col" style={{
                        backgroundImage: `url(${BackgroundImage})`,
                        backgroundPosition: 'center top',
                        WebkitBackgroundPosition: 'center top',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        position: 'relative',
                    }}>
                        <div className="w-screen h-screen flex flex-col" style={{
                            backgroundImage: `url(${this.state.backgroundURL})`,
                            backgroundPosition: 'center top',
                            WebkitBackgroundPosition: 'center top',
                            backgroundSize: 'cover',
                            WebkitBackgroundSize: 'cover'
                        }}>
                            <div className='relative w-full h-1/6 flex justify-between px-3'>
                                <div className='h-full flex space-x-5'>
                                    <div className='w-52 h-20 flex justify-center space-x-3 place-items-center' style={{
                                        backgroundImage: `url(${LeftTopImage})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                    }}>
                                        <img className='bg-contain h-8' src={BalanceImage} alt="balance"></img>
                                        <div className='text-white'>
                                            <h1 className='font-bold'>{this.state.walletInfo.balance} UPC</h1>
                                            <h5 className='text-xs text-gray-500 uppercase'>balance</h5>
                                        </div>
                                    </div>

                                    <div className='w-52 h-20 flex justify-center space-x-3 place-items-center' style={{
                                        backgroundImage: `url(${LeftTopImage})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                    }}>
                                        <img className='bg-contain h-8' src={BettedImage} alt="betted"></img>
                                        <div className='text-white'>
                                            <h1 className='font-bold'>{this.state.betInfo.bettedAmount.toString().slice(0, this.state.betInfo.bettedAmount.toString().indexOf('.') + 4)} UPC</h1>
                                            <h5 className='text-xs text-gray-500 uppercase'>total sum betted</h5>
                                        </div>
                                    </div>
                                </div>

                                {/* <div className='w-36 h-36 flex flex-col justify-center place-items-center' style={{
                                        backgroundImage: `url(${RoundStartImage})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                    }}>
                                    <h1 className='text-5xl font-bold text-score'>5</h1>
                                    <h5 className='text-gray-500'>ROUND</h5>
                                </div> */}

                                <div className='h-full flex space-x-5'>
                                    <div className='w-52 h-20 flex justify-center space-x-3 place-items-center' style={{
                                        backgroundImage: `url(${RightTopImage})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                    }}>
                                        <img className='bg-contain h-8' src={HistoricalImage} alt="historical"></img>
                                        <div className='text-white'>
                                            <h1 className='font-bold'>{this.state.betInfo.historical}</h1>
                                            <h5 className='text-xs text-gray-500 uppercase'>historical bets</h5>
                                        </div>
                                    </div>

                                    <div className='w-52 h-20 flex justify-center space-x-3 place-items-center' style={{
                                        backgroundImage: `url(${RightTopImage})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                    }}>
                                        <img className='bg-contain h-8' src={CurrentImage} alt="betted"></img>
                                        <div className='text-white'>
                                            <h1 className='font-bold'>{this.state.betInfo.current}</h1>
                                            <h5 className='text-xs text-gray-500 uppercase'>current history</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col justify-center place-items-center relative w-max h-4/6 px-5'>
                                <div className='w-32 h-32'>
                                    <CircleProgressBar
                                        color="#6BC33D"
                                        symbol="DAYS"
                                        percent={this.state.timeInfo.remainDays * 100 / this.state.totalDay}
                                        value={this.state.timeInfo.remainDays} />
                                </div>
                                <div className='flex justify-center space-x-5'>
                                    <div className='w-32 h-32'>
                                        <CircleProgressBar
                                            color="#FF0000"
                                            symbol="HOURS"
                                            percent={this.state.timeInfo.remainHours * 100 / 24}
                                            value={this.state.timeInfo.remainHours} />
                                    </div>
                                    <div className='w-32 h-32'>
                                        <CircleProgressBar
                                            color="#FF8C00"
                                            symbol="MINUTES"
                                            percent={this.state.timeInfo.remainMinutes * 100 / 60}
                                            value={this.state.timeInfo.remainMinutes} />
                                    </div>
                                </div>
                                <div className='w-32 h-32'>
                                    <CircleProgressBar
                                        color="#3c9ee5"
                                        symbol="SECONDS"
                                        percent={this.state.timeInfo.remainSeconds * 100 / 60}
                                        value={this.state.timeInfo.remainSeconds} />
                                </div>
                            </div>

                            <div className='relative w-full h-1/6 flex justify-between'>
                                <div className='w-60 h-24 flex justify-end space-x-3 place-items-center px-1 z-30' style={{
                                    backgroundImage: `url(${LeftBottomImage})`,
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: 'contain',
                                    position: 'relative',
                                }}>
                                    <a className='w-52 h-20 transform hover:scale-102 cursor-pointer flex flex-col justify-center text-center z-30' style={{
                                        backgroundImage: `url(${LeftBottomButton})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                        transformOrigin: '50% 50%',
                                    }}
                                    href="#a"
                                    onClick={this.bet}
                                    >
                                        <h1 className='text-white text-lg font-bold uppercase -mt-1'>{this.state.bettingState === 2 ? "claim now" : "bet now"}</h1>
                                    </a>
                                </div>

                                <div className='w-60 h-24 flex justify-left place-items-center px-1 z-30' style={{
                                    backgroundImage: `url(${RightBottomImage})`,
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: 'contain',
                                    position: 'relative',
                                }}>
                                    <a className='w-52 h-20 transform cursor-pointer flex flex-col justify-center text-center wallet-button z-30' style={{
                                        backgroundImage: `url(${LeftBottomButton})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                        transformOrigin: '50% 50%',
                                    }}
                                    href="#b"
                                    onClick={this.connectWallet}
                                    >
                                        <h1 className='text-white text-lg font-bold uppercase -mt-1 transform' style={{
                                            transform: 'scaleX(-1)'
                                        }}>{this.state.walletInfo.address !== '' ? this.convertAddresstoName(this.state.walletInfo.address) : 'connect wallet'}</h1>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* This is design for mobile */}
                <div className='block laptop:hidden'>
                    <div className="w-screen h-screen bg-black flex flex-col justify-center" style={{
                        // // backgroundImage: `url(${BackgroundImage})`,
                        // backgroundPosition: 'center top',
                        // WebkitBackgroundPosition: 'center top',
                        // backgroundRepeat: 'no-repeat',
                        // backgroundSize: 'cover',
                        // position: 'relative',
                    }}>
                        <div className='w-full h-full'>
                            <div className='w-screen h-10% bg-top'></div>
                            <div className="w-screen h-4/5 flex flex-col" style={{
                                backgroundImage: `url(${this.state.backgroundURL})`,
                                backgroundPosition: 'center top',
                                WebkitBackgroundPosition: 'center top',
                                backgroundSize: 'cover',
                                WebkitBackgroundSize: 'cover'
                            }}>
                            </div>
                            <div className='w-screen h-10% bg-floor'></div>
                        </div>
                        <div className='w-screen h-screen absolute flex flex-col'>
                            <div className='relative w-screen flex justify-between mt-5'>
                                <div className='h-full flex flex-col space-y-1'>
                                    <div className='mobile:w-36 mobile:h-12 vm:w-44 vm:h-16 flex justify-center space-x-3 place-items-center' style={{
                                        backgroundImage: `url(${LeftTopImage})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                    }}>
                                        <img className='bg-contain h-8 mobile:h-5' src={BalanceImage} alt="balance"></img>
                                        <div className='text-white'>
                                            <h1 className='font-bold text-xs'>{this.state.walletInfo.balance} UPC</h1>
                                            <h5 className='text-xt text-gray-500 uppercase'>balance</h5>
                                        </div>
                                    </div>

                                    <div className='mobile:w-36 mobile:h-12 vm:w-44 vm:h-16 flex justify-center space-x-2 place-items-center' style={{
                                        backgroundImage: `url(${LeftTopImage})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                    }}>
                                        <img className='bg-contain h-8 mobile:h-5' src={BettedImage} alt="betted"></img>
                                        <div className='text-white'>
                                            <h1 className='font-bold text-xs'>{this.state.betInfo.bettedAmount.toString().slice(0, this.state.betInfo.bettedAmount.toString().indexOf('.') + 4)} UPC</h1>
                                            <h5 className='text-xt text-gray-500 uppercase'>total sum betted</h5>
                                        </div>
                                    </div>
                                </div>

                                <div className='relative flex flex-col space-y-1'>
                                    <div className='mobile:w-36 mobile:h-12 vm:w-44 vm:h-16 flex justify-center space-x-3 place-items-center' style={{
                                        backgroundImage: `url(${RightTopImage})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                    }}>
                                        <img className='bg-contain h-8 mobile:h-5' src={HistoricalImage} alt="historical"></img>
                                        <div className='text-white'>
                                            <h1 className='font-bold mobile:text-xs'>{this.state.betInfo.historical}</h1>
                                            <h5 className='text-xt text-gray-500 uppercase'>historical bets</h5>
                                        </div>
                                    </div>

                                    <div className='mobile:w-36 mobile:h-12  vm:w-44 vm:h-16 flex justify-center space-x-3 place-items-center' style={{
                                        backgroundImage: `url(${RightTopImage})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                    }}>
                                        <img className='bg-contain h-8 mobile:h-5' src={CurrentImage} alt="betted"></img>
                                        <div className='text-white'>
                                            <h1 className='font-bold mobile:text-xs'>{this.state.betInfo.current}</h1>
                                            <h5 className='text-xt text-gray-500 uppercase'>current history</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='w-full h-4/6'></div>

                            <div className='relative w-full flex justify-between place-items-center my-3'>
                                <div className='mobile:w-36 mobile:h-12 vm:w-44 vm:h-16 flex justify-end space-x-3 place-items-center px-1 flex-shrink z-30' style={{
                                    backgroundImage: `url(${LeftBottomImage})`,
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: 'contain',
                                    position: 'relative',
                                }}>
                                    <a className='mobile:w-32 mobile:h-10 vm:w-40 vm:h-14 transform hover:scale-102 cursor-pointer flex flex-col justify-center text-center flex-shrink z-30' style={{
                                        backgroundImage: `url(${LeftBottomButton})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                        transformOrigin: '50% 50%',
                                    }}
                                    href="#a"
                                    onClick={this.bet}
                                    >
                                        <h1 className='text-white text-xs font-bold uppercase -mt-1'>{this.state.bettingState === 2 ? "claim now" : "bet now"}</h1>
                                    </a>
                                </div>

                                <div className='mobile:w-36 mobile:h-12 vm:w-44 vm:h-16 flex justify-left place-items-center px-1 flex-shrink z-30' style={{
                                    backgroundImage: `url(${RightBottomImage})`,
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: 'contain',
                                    position: 'relative',
                                }}>
                                    <a className='mobile:w-32 mobile:h-10 vm:w-40 vm:h-14 transform cursor-pointer flex flex-col justify-center text-center wallet-button flex-shrink z-30' style={{
                                        backgroundImage: `url(${LeftBottomButton})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'contain',
                                        position: 'relative',
                                        transformOrigin: '50% 50%',
                                    }}
                                    href="#b"
                                    onClick={this.connectWallet}
                                    >
                                        <h1 className='text-white text-xs font-bold uppercase -mt-1 transform' style={{
                                            transform: 'scaleX(-1)'
                                        }}>{this.state.walletInfo.address !== '' ? this.convertAddresstoName(this.state.walletInfo.address) : 'connect wallet'}</h1>
                                    </a>
                                </div>
                            </div>

                            <div className='flex justify-center relative px-5'>
                                <div className='w-24 h-24'>
                                    <CircleProgressBar
                                        color="#6BC33D"
                                        symbol="DAYS"
                                        percent={this.state.timeInfo.remainDays * 100 / this.state.totalDay}
                                        value={this.state.timeInfo.remainDays} />
                                </div>
                                <div className='w-24 h-24'>
                                    <CircleProgressBar
                                        color="#FF0000"
                                        symbol="HOURS"
                                        percent={this.state.timeInfo.remainHours * 100 / 24}
                                        value={this.state.timeInfo.remainHours} />
                                </div>
                                <div className='w-24 h-24'>
                                    <CircleProgressBar
                                        color="#FF8C00"
                                        symbol="MINUTES"
                                        percent={this.state.timeInfo.remainMinutes * 100 / 60}
                                        value={this.state.timeInfo.remainMinutes} />
                                </div>
                                <div className='w-24 h-24'>
                                    <CircleProgressBar
                                        color="#3c9ee5"
                                        symbol="SECONDS"
                                        percent={this.state.timeInfo.remainSeconds * 100 / 60}
                                        value={this.state.timeInfo.remainSeconds} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className='h-screen w-screen bg-transparent fixed inset-0'>
                    <div className='bg-transparent' style={{height: `${this.state.glassPatternInfo.paddingTopOfGlass}`}}></div>
                    <div className='w-screen bg-transparent flex flex-col justify-between place-items-center' style={{height: `${this.state.glassPatternInfo.heightOfGlass}`}}>
                        {this.state.glassPatternInfo.glassButtonState.map((item, i) => {
                            if(i % 2 === 0) {
                                return (
                                    <div className='flex space-x-5 h-1/5' key={i}>
                                        <div className='bg-white bg-opacity-0 h-full cursor-pointer' id={5 - i - 1} onClick={(e) => this.changeGlassButtonState(e.target.id)} style={{width: `${this.state.glassPatternInfo.widthOfGlassButton}`}}></div>
                                        <div className='bg-white bg-opacity-0 h-full cursor-pointer' id={5 - i} onClick={(e) => this.changeGlassButtonState(e.target.id)} style={{width: `${this.state.glassPatternInfo.widthOfGlassButton}`}}></div>
                                    </div>
                                )
                            }
                            return (
                                <div style={{ display: 'none' }} key={i}></div>
                            )
                        })}
                    </div>
                </div>

                <Modal isOpen={this.state.isModalOpen}
                       onClose={() => this.setState({
                            ...this.state,
                            glassPatternInfo: {
                                ...this.state.glassPatternInfo,
                                glassButtonState: [-1, -1, -1, -1, -1, -1]
                            },
                            isModalOpen: false,
                            backgroundURL: BackgroundImage
                })}>
                    <div className='flex flex-col justify-center place-items-center space-y-5 w-full h-full'>
                        <h1 className='text-3xl font-bold text-center uppercase' style={{color: "#063860"}}>
                            You are going to bet number {this.state.betInfo.selectedNumber + 1}.
                        </h1>
                        <div className='space-y-2'>
                            <h2 className='text-white' style={{color: "#0d4b7c"}}>Input here UPC amount you want.</h2>
                            <input className='mobile:px-3 px-5 py-2 outline-none border border-gray-300 rounded-md text-gray-500 font-bold text-center'
                                type="text"
                                ref={this.textInput}
                                onChange={(e) => this.setState({...this.state, betInfo: {...this.state.betInfo, selectedAmount: parseFloat(e.target.value)}})}/>
                        </div>
                        <button className='text-white text-md font-bold px-10 py-2 shadow-sm'
                                onClick={this.sendCryptoToContract}
                                style={{backgroundColor: "#063860"}} >BET</button>
                    </div>
                </Modal>
            </div>
        )
    }
}

export default withToast(Home);