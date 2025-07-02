import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Wrench,
    Store,
    Search,
    DollarSign,
    ShieldCheck,
    CheckCircle,
    XCircle,
    ArrowRight,
    Star,
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Lock,
    BadgeCheck,
} from "lucide-react";
import {
    FaMapMarkerAlt,
    FaShieldAlt,
    FaUsers,
    FaBoxOpen,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";

const carLogos = [
    "https://cdn.worldvectorlogo.com/logos/toyota-1.svg",
    "https://cdn.worldvectorlogo.com/logos/mercedes-benz-6.svg",
    "https://cdn.worldvectorlogo.com/logos/bmw.svg",
    "https://cdn.worldvectorlogo.com/logos/nissan-2.svg",
    "https://cdn.worldvectorlogo.com/logos/porsche-3.svg",
    "https://cdn.worldvectorlogo.com/logos/honda-1.svg",
    "https://cdn.worldvectorlogo.com/logos/ford-1.svg",
    "https://cdn.worldvectorlogo.com/logos/audi.svg",
    "https://cdn.worldvectorlogo.com/logos/mitsubishi-motors-1.svg",
    "https://cdn.worldvectorlogo.com/logos/lexus.svg",
    "https://cdn.worldvectorlogo.com/logos/volkswagen-1.svg",
    "https://cdn.worldvectorlogo.com/logos/subaru.svg",
    "https://cdn.worldvectorlogo.com/logos/tesla-motors.svg",
    "https://cdn.worldvectorlogo.com/logos/acura.svg",
    "https://cdn.worldvectorlogo.com/logos/infiniti-1.svg",
    "https://cdn.worldvectorlogo.com/logos/kia-motors.svg",
    "https://cdn.worldvectorlogo.com/logos/hyundai-motor-company.svg",
    "https://cdn.worldvectorlogo.com/logos/maserati.svg",
    "https://cdn.worldvectorlogo.com/logos/land-rover.svg",
    "https://cdn.worldvectorlogo.com/logos/peugeot.svg",
    "https://cdn.worldvectorlogo.com/logos/renault.svg",
    "https://cdn.worldvectorlogo.com/logos/chevrolet.svg",
    "https://cdn.worldvectorlogo.com/logos/bentley.svg",
    "https://cdn.worldvectorlogo.com/logos/bugatti-2.svg",
    "https://cdn.worldvectorlogo.com/logos/jeep.svg",
    "https://cdn.worldvectorlogo.com/logos/rolls-royce-motor-cars-1.svg",
    "https://cdn.worldvectorlogo.com/logos/ram-trucks-1.svg",
    "https://cdn.worldvectorlogo.com/logos/gmc-2.svg",
];

const Header = ({ onLoginClick }: { onLoginClick: () => void }) => (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                    <Link to="/" className="text-xl font-bold text-blue-600">
                        EasyCarParts
                    </Link>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                    <Button variant="ghost" onClick={onLoginClick}>
                        <Wrench className="mr-2 h-4 w-4" />
                        Login
                    </Button>
                    <div className="border-l border-gray-300 h-6"></div>
                    <span className="text-sm text-gray-500">🇦🇪 UAE</span>
                </div>
                <div className="md:hidden">
                    <Button variant="ghost" onClick={onLoginClick}>
                        Login
                    </Button>
                </div>
            </div>
        </div>
    </header>
);

const HeroSection = () => {
    const navigate = useNavigate();
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <section className="relative text-white py-20 lg:py-28 overflow-hidden">
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center blur-sm"
                    style={{
                        backgroundImage: `url('/assets/heroimagenew.png')`,
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.3) 100%)`,
                    }}
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
                    Get The Right Car Parts — Fast.
                </h1>
                <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-3xl mx-auto [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
                We find, inspect, and deliver the right part — so you don’t have to.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-lg font-semibold shadow-xl hover:shadow-2xl transition-transform duration-200 ease-in-out transform hover:scale-105 w-full sm:w-auto [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]"
                        onClick={() => {
                            navigate("/signup");
                        }}>
                        <Search className="mr-3 h-5 w-5" />
                        Find My Car Parts
                    </Button>
                </div>
                <p className="text-gray-300 mt-6 text-sm flex items-center justify-center">
                    <ShieldCheck className="mr-2 h-4 w-4 text-green-400" />
                    <span className="[text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
                        Trusted by 500+ UAE garages and workshops.
                    </span>
                </p>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </section>
    );
};

const StatsSection = () => {
    const stats = [
        {
            icon: (
                <FaMapMarkerAlt className="mx-auto text-blue-600 text-4xl mb-4" />
            ),
            number: "7",
            label: "Emirates Coverage",
        },
        {
            icon: (
                <FaShieldAlt className="mx-auto text-blue-600 text-4xl mb-4" />
            ),
            number: "42+",
            label: "Verified Parts Suppliers",
        },
        {
            icon: <FaUsers className="mx-auto text-blue-600 text-4xl mb-4" />,
            number: "180+",
            label: "Active Parts Buyers",
        },
        {
            icon: <FaBoxOpen className="mx-auto text-blue-600 text-4xl mb-4" />,
            number: "8K+",
            label: "Car Parts Available",
        },
    ];

    return (
        <section className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat, index) => (
                        <div key={index} className="p-4">
                            {stat.icon}
                            <div className="text-3xl font-bold text-blue-600">
                                {stat.number}
                            </div>
                            <div className="mt-1 text-gray-500">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ProblemSolutionSection = () => (
    <section className="py-12 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Old Way vs EasyCarParts
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                    Stop wasting time. Start getting the correct, parts faster.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <Card className="border-red-200 shadow-lg">
                    <CardHeader>
                        <h3 className="text-2xl font-bold text-red-600">
                            The Old Way
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <XCircle className="h-6 w-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                                <span>
                                    Staff waste hours driving to many shops
                                </span>
                            </li>
                            <li className="flex items-start">
                                <XCircle className="h-6 w-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Can't find the part you need</span>
                            </li>
                            <li className="flex items-start">
                                <XCircle className="h-6 w-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                                <span>No clear price or quality</span>
                            </li>
                            <li className="flex items-start">
                                <XCircle className="h-6 w-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                                <span>No guarantee it will fit</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
                <Card className="border-green-200 shadow-lg">
                    <CardHeader>
                        <h3 className="text-2xl font-bold text-green-600">
                            EasyCarParts Way
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Send request online in 1 minute</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                <span>
                                We do the sourcing and inspection for you
                                </span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Transparent pricing and verified vendors</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                <span>Fast delivery, cash or card on arrival</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    </section>
);

const HowItWorksSection = () => (
    <section className="py-12 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    3 Easy Steps
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                    Get the right parts in just a few clicks.
                </p>
            </div>
            <div className="relative">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                    {/* Step 1 */}
                    <Card className="text-center shadow-md border-t-4 border-blue-500">
                        <CardHeader>
                            <div className="mx-auto bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                                <p className="text-blue-600 text-2xl font-bold">
                                    1
                                </p>
                            </div>
                            <h3 className="text-xl font-bold">Send Request</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Tell us your car and part details.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Step 2 */}
                    <Card className="text-center shadow-md border-t-4 border-blue-500">
                        <CardHeader>
                            <div className="mx-auto bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                                <p className="text-blue-600 text-2xl font-bold">
                                    2
                                </p>
                            </div>
                            <h3 className="text-xl font-bold">We Source</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                            Our team finds, verifies, and checks parts.{" "}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Step 3 */}
                    <Card className="text-center shadow-md border-t-4 border-blue-500">
                        <CardHeader>
                            <div className="mx-auto bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                                <p className="text-blue-600 text-2xl font-bold">
                                    3
                                </p>
                            </div>
                            <h3 className="text-xl font-bold">
                                Pay on Delivery
                            </h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Inspect the part. Pay by cash or card.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </section>
);

const CarBrandsSection = () => {
    const brands = [
        "Toyota",
        "Nissan",
        "Honda",
        "Mitsubishi",
        "Lexus",
        "Hyundai",
        "Kia",
        "Ford",
        "Chevrolet",
        "Jeep",
        "Volkswagen",
        "Audi",
        "BMW",
        "Mercedes-Benz",
        "Land Rover",
        "Porsche",
        "Subaru",
        "Tesla",
        "Renault",
        "Maserati",
        "Jaguar",
        "Peugeot",
        "Fiat",
        "Citroen",
    ];

    // Helper to format brand names into file names
    const formatBrandToLogoPath = (brand: string) => {
        let fileName = brand.toLowerCase().replace(/ /g, "-");
        // Specific known filename issues
        if (fileName === "mercedes-benz") fileName = "mercedes";
        if (fileName === "land-rover") fileName = "land rover";
        if (fileName === "volkswagen") fileName = "vw";
        if (fileName === "peugeot") fileName = "peugot";

        return `/assets/logos/${fileName}.svg`;
    };

    return (
        <section className="py-12 lg:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Parts For All Major Car Brands
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Trusted by garages across the UAE for genuine and
                        aftermarket parts.
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {brands.map((brand) => (
                        <div
                            key={brand}
                            className="flex justify-center items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-24">
                            <img
                                src={formatBrandToLogoPath(brand)}
                                alt={brand}
                                className="h-16 object-contain"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; // prevent looping
                                    target.src = "/assets/logos/other-car.svg"; // fallback image
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

interface CTACardProps {
    icon: React.ReactNode;
    title: string;
    description: string[];
    buttonText: string;
    buttonVariant:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "ghost"
        | "link"
        | null
        | undefined;
    subtext: string;
    isBuyer: boolean;
    onClick: () => void; // Add this line
}

const CTACard: React.FC<CTACardProps> = ({
    icon,
    title,
    description,
    buttonText,
    buttonVariant,
    subtext,
    isBuyer,
    onClick, // Add this line
}) => (
    <div className="bg-white rounded-lg shadow-xl p-8 text-center transition-transform transform hover:-translate-y-2 flex flex-col h-full">
        <div className="flex-grow">
            <div
                className={`inline-block p-4 rounded-full mb-6 ${
                    isBuyer ? "bg-blue-100" : "bg-green-100"
                }`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
            <div className="space-y-2 text-gray-600 mb-6">
                {description.map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
        </div>
        <div className="mt-auto">
            <Button
                size="lg"
                variant={buttonVariant}
                className="w-full sm:w-auto"
                onClick={onClick} // Add this line
            >
                {buttonText}
            </Button>
            <p className="text-xs text-gray-500 mt-2">{subtext}</p>
        </div>
    </div>
);

const DualCTASection = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalConfig, setAuthModalConfig] = useState<{
        showSignup: boolean;
        signupType?: "buyer" | "vendor";
    }>({ showSignup: true }); // Set default to true
    const navigate = useNavigate();

    const handleBuyerClick = () => {
        navigate("/signup");
    };

    const handleVendorClick = () => {
        navigate("/signup");
    };

    return (
        <section className="bg-white py-12 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                    <CTACard
                        isBuyer={true}
                        icon={<Wrench className="h-10 w-10 text-blue-600" />}
                        title="For Garages & Repair Shops"
                        description={[
                            "Order what you need.",
                            "We do ALL the legwork.",
                            "Verified parts, delivered fast.",
                            "Pay after inspection, cash or card.",
                        ]}
                        buttonText="Start Buying Parts"
                        subtext="Free to join — No monthly fees"
                        buttonVariant="default"
                        onClick={handleBuyerClick} // Use the handler
                    />
                    <CTACard
                        isBuyer={false}
                        icon={<Store className="h-10 w-10 text-green-600" />}
                        title="For Parts Suppliers"
                        description={[
                            "Get more orders.",
                            "Receive buyer requests daily.",
                            "Sell your stock easily.",
                            "Fast payouts.",
                        ]}
                        buttonText="Start Selling Parts"
                        subtext="Low fees — Fast payments"
                        buttonVariant="secondary"
                        onClick={handleVendorClick} // Use the handler
                    />
                </div>
            </div>
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </section>
    );
};

const TestimonialCard = ({
    text,
    author,
}: {
    text: string;
    author: string;
}) => (
    <Card className="text-center p-6 bg-white shadow-lg h-full flex flex-col">
        <CardContent className="flex-grow flex flex-col justify-center">
            <div
                className="text-yellow-400 text-xl mb-4"
                aria-label="5 out of 5 stars">
                {"⭐⭐⭐⭐⭐"}
            </div>
            <blockquote className="text-gray-700 italic mb-4">
                "{text}"
            </blockquote>
            <footer className="font-semibold text-gray-800">— {author}</footer>
        </CardContent>
    </Card>
);

const TestimonialsSection = () => {
    const testimonials = [
        {
            text: "Saves us hours daily. We get parts fast, no stress.",
            author: "Ahmed Hassan, Al Qusais Auto Repair",
        },
        {
            text: "Our sales went up 300%. Easy platform to sell parts.",
            author: "Mohammed Khalil, Sharjah Auto Parts",
        },
        {
            text: "Game changer for our garage. Very simple system.",
            author: "Salem Al Mansouri, Dubai Motor Works",
        },
    ];

    return (
        <section className="py-12 lg:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Trusted by UAE's Top Garages
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={index}
                            text={testimonial.text}
                            author={testimonial.author}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const PaymentTrustSection = () => {
    const features = [
        {
            icon: <ShieldCheck className="h-8 w-8 text-blue-600" />,
            title: "SSL Secured",
            description: "256-bit encryption",
        },
        {
            icon: <CreditCard className="h-8 w-8 text-blue-600" />,
            title: "Multiple Payment Methods",
            description: "Cards, Bank Transfer, Digital Wallets",
        },
        {
            icon: <Lock className="h-8 w-8 text-blue-600" />,
            title: "Fraud Protection",
            description: "Advanced security monitoring",
        },
        {
            icon: <BadgeCheck className="h-8 w-8 text-blue-600" />,
            title: "Money Back Guarantee",
            description: "100% satisfaction guaranteed",
        },
    ];

    const paymentMethods = [
        { src: "/assets/Visa.png", alt: "Visa" },
        { src: "/assets/Mastercard.png", alt: "Mastercard" },
        {
            src: "/assets/Stripe_(company)-Powered-by-Stripe-Outline-Logo.wine.svg",
            alt: "Stripe",
        },
        { src: "/assets/ApplePay.png", alt: "Apple Pay" },
        { src: "/assets/GooglePay.png", alt: "Google Pay" },
    ];

    return (
        <section className="py-12 lg:py-20 bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Payment You Can Trust
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                    Your transactions are protected by industry-leading security
                    measures and payment processing standards.
                </p>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <div className="bg-blue-100 p-4 rounded-full mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex justify-center items-center flex-wrap gap-x-8 gap-y-4">
                    {paymentMethods.map((method, index) => (
                        <img
                            key={index}
                            src={method.src}
                            className="h-8 sm:h-10 object-contain"
                            alt={method.alt}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const Footer = () => (
    <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-400 text-sm">
                <p className="font-bold text-lg text-white mb-2">
                    EasyCarParts
                </p>
                <p>
                    © {new Date().getFullYear()} Easy Auto FZE LLC. All rights
                    reserved.
                </p>
                <p>Made in the UAE</p>
            </div>
        </div>
    </footer>
);

export const HomeDesign = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalConfig, setAuthModalConfig] = useState<{
        showSignup: boolean;
        signupType?: "buyer" | "vendor";
    }>({ showSignup: false });
    const navigate = useNavigate();
    const handleLoginClick = () => {
        setAuthModalConfig({ showSignup: false });
        setShowAuthModal(true);
    };
    return (
        <div className="bg-white">
            <Header onLoginClick={handleLoginClick} />
            <main>
                <HeroSection />
                <StatsSection />
                <ProblemSolutionSection />
                <HowItWorksSection />
                <CarBrandsSection />
                <DualCTASection />
                <TestimonialsSection />
                <PaymentTrustSection />
            </main>
            <Footer />
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />{" "}
        </div>
    );
};
