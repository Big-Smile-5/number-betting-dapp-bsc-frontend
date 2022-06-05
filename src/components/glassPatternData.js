import BackgroundImange from '../assets/glass_combinations/Background.jpg'
import LeftImage from '../assets/glass_combinations/Left.jpg'
import RightImage from '../assets/glass_combinations/Right.jpg'
import LeftLeftImage from '../assets/glass_combinations/Left_Left.jpg'
import LeftRightImage from '../assets/glass_combinations/Left_Right.jpg'
import RightLeftImage from '../assets/glass_combinations/Right_Left.jpg'
import RightRightImage from '../assets/glass_combinations/Right_Right.jpg'
import LeftLeftLeftImage from '../assets/glass_combinations/Left_Left_Left.jpg'
import LeftLeftRightImage from '../assets/glass_combinations/Left_Left_Right.jpg'
import LeftRightLeftImage from '../assets/glass_combinations/Left_Right_Left.jpg'
import LeftRightRightImage from '../assets/glass_combinations/Left_Right_Right.jpg'
import RightLeftLeftImage from '../assets/glass_combinations/Right_Left_Left.jpg'
import RightLeftRightImage from '../assets/glass_combinations/Right_Left_Right.jpg'
import RightRightLeftImage from '../assets/glass_combinations/Right_Right_Left.jpg'
import RightRightRightImage from '../assets/glass_combinations/Right_Right_Right.jpg'

const patterns = {
    indexs: ['background', '0', '1', '00', '01', '10', '11', '000', '001', '010', '011', '100', '101', '110', '111'],
    urls: [
        BackgroundImange,
        LeftImage, RightImage,
        LeftLeftImage, LeftRightImage, RightLeftImage, RightRightImage,
        LeftLeftLeftImage, LeftLeftRightImage, LeftRightLeftImage, LeftRightRightImage, RightLeftLeftImage, RightLeftRightImage, RightRightLeftImage, RightRightRightImage
    ]
}

export default patterns;