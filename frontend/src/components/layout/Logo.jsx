import { Link } from "react-router-dom";
import LogoImage from '../../assets/logo.png';

export default function Logo() {
    return (
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img src={LogoImage} alt="Logo" className="w-20 h-20 object-contain" />
        </Link>
    )
}