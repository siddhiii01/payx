import type { JSX } from "react";
import { Navbar } from "../Layout/Navbar";
import { HeroSection } from "./HeroSection";
import { Footer } from "../Layout/Footer";

export const Home = (): JSX.Element => {
    return (
        <>
            <Navbar />
            <HeroSection />
            <Footer />
        </>
        
    );
}