import React, {useState} from "react";
import type { ChangeEvent, FormEvent} from "react";
import type { SignupCredentials } from "../types/auth.types";
import SignupRoute from "../services/SignupService";


export const Signup: React.FC = () => {
    const [formData, setFormData] = useState<SignupCredentials>({
        name: '',
        email: '',
        password: '',
        number : ''
    }) //adding states for the input fields
   
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault() //stops refreshing

        await SignupRoute(formData);
        setFormData({name: '', number:'', email: '', password: ''});
        
    }

    return (
        <>
        <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name:</label>
            <input 
                type="text"
                id="name"
                value={formData.name} // Ties the input to state
                name="name"
                placeholder="Enter your full name"
                onChange={handleChange} // Handle changes
            />

            <label htmlFor="email">Email: </label>
            <input 
                type="email"
                id="email"
                value={formData.email}
                name="email"
                placeholder="example@domain.com"
                onChange={handleChange}
            />

            <label htmlFor="number">Phone Number:</label>
            <input 
                type="text"
                id="number"
                value={formData.number}
                name="number"
                placeholder="+1 (555) 123-4567"
                onChange={handleChange}
            />

            <label htmlFor="password">Password:</label>
            <input 
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
            />
            <button type="submit">Signup</button>
        </form>
        </>
    );
}