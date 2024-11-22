import { useForm } from "react-hook-form"
import Swal from "sweetalert2";
import BeatLoader from "react-spinners/ClipLoader";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUserInfo } from "../../Redux/Features/userInfo";

import './index.css';
import { backend, realtimeDb } from '../../firebase/config';

//the error messages can come from constants....
const RegistrationPage = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const temp = {};

    const writeUserDataToDb = async (uid, name, role, userId) => {

        const userRef = realtimeDb.ref('/users/' + uid);
        await userRef.set({ name: name, role: role, userId: userId });
        userRef.on('value', (snapshot) => {

            temp['role'] = role;
            temp['userId'] = userId;
            temp['name'] = name;
            dispatch(updateUserInfo(temp))
            navigate('/video-tagging');
            setIsRegistering(false);
        });

        return userRef;
    }
    //watch is not used right now but it CAN be used to monitor value, instead of console.logs...
    const {
        register,
        handleSubmit,
        watch,
        getValues,
        formState: { errors },
    } = useForm();

    const handleRegistration = (data) => {

        const register = async () => {
            setIsRegistering(true);

            const rawRes = await fetch('https://registeruser-mlapekco7q-uc.a.run.app', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "email": `${data.email}`,
                    "name": `${data.name}`,
                    "role": `${data.role}`,
                    "password": "newpass1234"
                })
            });
            const res = await rawRes.json();
            //const res = await backend('registerUser', { email: data.email, name: data.name, role: data.role });

            if (res.message) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    footer: res.message
                });
            } else if (res.uid) {
                const newUid = res.uid;
                const name = res.name;
                const role = res.role;
                const userId = res.userId;
                //lets change the dispatch location
                // temp['role'] = role;
                // temp['userId'] = userId;
                // dispatch(updateUserInfo(temp))
                //todo
                const write = await writeUserDataToDb(newUid, name, role, userId);
                return write;

            }
        }
        register();
    }


    return <div id="registrationPage">
        <div id="registrationContainer">
            <h3>Register new moderator</h3>
            <form onSubmit={handleSubmit(handleRegistration)} autoComplete="off">
                <input
                    type="text"
                    placeholder="email"
                    {...register("email", {
                        required: true, pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Invalid email format"
                        }
                    })}
                />
                {/*We could potentially fire swal here as well... */}
                {errors.email && <span>The email field is mandatory</span>}
                <input
                    type="text"
                    placeholder="name"
                    {...register("name", { required: true })}
                />
                {errors.name && <span>The name field is mandatory</span>}
                <select {...register("role", { required: true })} defaultValue="">
                    <option value="" disabled>Please select an option</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                </select>
                {errors.role && <span>The role dropdown is mandatory</span>}
                {/**perhaps to not drive admins crazy both the passwords should be clearly readable not hidden... */}
                <input
                    type="text"
                    placeholder="password"
                    {...register("password", { required: true })}
                />
                {errors.password && <span>The password field is mandatory</span>}
                <input
                    type="text"
                    placeholder="retype password"
                    {...register("passwordRetype", {
                        validate: (value) => {
                            const { password } = getValues();
                            return password === value || "Passwords should match";
                        }
                    })}
                />
                {errors.passwordRetype && <span>{errors.passwordRetype.message}</span>}
                {isRegistering ? <BeatLoader size={10} /> : <button type="submit" id="registerButton">Register</button>}
            </form>
        </div>
    </div>
}

export default RegistrationPage;