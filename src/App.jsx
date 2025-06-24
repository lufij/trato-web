import React, {
    useState,
    useEffect,
    useMemo,
    createContext,
    useContext
} from 'react';
import {
    initializeApp
} from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    setDoc,
    getDoc,
    query,
    where,
    getDocs,
    onSnapshot
} from 'firebase/firestore';
import {
    Users,
    LayoutDashboard,
    Package,
    ShoppingBag,
    DollarSign,
    Network,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Upload,
    Copy,
    Check,
    PlusCircle,
    Trash2
} from 'lucide-react';


// FIREBASE CONFIG =================================================================
// PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE (Paso 1 de la guía)
const firebaseConfig = {
  apiKey: "AIzaSyAtM2HRvyywIO4f2oVJmQpscbER9KwcDGo",
  authDomain: "trato-web.firebaseapp.com",
  projectId: "trato-web",
  storageBucket: "trato-web.firebasestorage.app",
  messagingSenderId: "536152998788",
  appId: "1:536152998788:web:0c94d184cfca42158353d1"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// STYLES & CONFIG =================================================================
const styles = {
    button: "bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out flex items-center justify-center gap-2 disabled:bg-gray-400",
    card: "bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300",
    input: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
    label: "block text-sm font-medium text-gray-700 mb-1",
    avatar: "w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-blue-600 font-bold text-xl",
};

// AUTH CONTEXT ===================================================================
const AuthContext = createContext(null);

const AuthProvider = ({
    children
}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Cargar datos del usuario desde Firestore
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserData(userDocSnap.data());
                } else {
                    console.log("No such user document!");
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return unsubscribe; // Cleanup subscription on unmount
    }, []);

    const logout = () => {
        signOut(auth);
    };

    const value = {
        currentUser,
        userData,
        isAuthenticated: !!currentUser,
        isAdmin: userData?.role === 'admin',
        logout,
        loading
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

// CART CONTEXT ===================================================================
// ... (El código del CartContext no necesita cambios y se mantiene igual)
const CartContext = createContext(null);
const CartProvider = ({
    children
}) => {
    const [cartItems, setCartItems] = useState([]);
    const addToCart = (product, quantity = 1) => {
        setCartItems(prevItems => {
            const itemInCart = prevItems.find(item => item.id === product.id);
            if (itemInCart) {
                return prevItems.map(item => item.id === product.id ? { ...item,
                    quantity: item.quantity + quantity
                } : item);
            }
            return [...prevItems, { ...product,
                quantity
            }];
        });
    };
    const removeFromCart = (productId) => setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    const updateQuantity = (productId, quantity) => {
        setCartItems(prevItems => prevItems.map(item => item.id === productId ? { ...item,
            quantity: Math.max(1, quantity)
        } : item));
    };
    const clearCart = () => setCartItems([]);
    const cartTotal = useMemo(() => cartItems.reduce((total, item) => total + item.distributorPrice * item.quantity, 0), [cartItems]);
    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal
    };
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
const useCart = () => useContext(CartContext);

// GENERIC COMPONENTS =============================================================
// ... (Los componentes genéricos no necesitan cambios)
const LoadingSpinner = () => ( <
    div className = "flex justify-center items-center h-full w-full" >
    <
    div className = "animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600" > < /div> <
    /div>
);
const PageTitle = ({
    title,
    children
}) => ( <
    div className = "flex justify-between items-center mb-6" >
    <
    h1 className = "text-3xl font-bold text-gray-800" > {
        title
    } < /h1> {
        children
    } <
    /div>
);
const StatCard = ({
    icon,
    title,
    value,
    color
}) => ( <
    div className = {
        `${styles.card} flex-1 min-w-[200px]`
    } >
    <
    div className = "flex items-center gap-4" > {
        React.createElement(icon, {
            className: `w-10 h-10 ${color}`
        })
    } <
    div >
    <
    p className = "text-gray-500 text-sm" > {
        title
    } < /p> <
    p className = "text-2xl font-bold text-gray-800" > {
        value
    } < /p> <
    /div> <
    /div> <
    /div>
);
const CopyToClipboard = ({
    text
}) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    };
    return ( <
        button onClick = {
            handleCopy
        }
        className = "p-2 rounded-md hover:bg-gray-200 transition-colors"
        title = "Copiar al portapapeles" > {
            copied ? < Check className = "w-5 h-5 text-green-500" / > : < Copy className = "w-5 h-5 text-gray-500" / >
        } <
        /button>
    );
};

// LAYOUT COMPONENTS ==============================================================
const Sidebar = ({
    isOpen,
    setIsOpen
}) => {
    const {
        logout,
        isAdmin
    } = useAuth();
    const navItems = isAdmin ?
        [{
            icon: LayoutDashboard,
            label: 'Dashboard Admin',
            view: 'admin_dashboard'
        }, {
            icon: Package,
            label: 'Gestionar Productos',
            view: 'admin_products'
        }, {
            icon: Users,
            label: 'Gestionar Usuarios',
            view: 'admin_users'
        }, {
            icon: ShoppingBag,
            label: 'Gestionar Pedidos',
            view: 'admin_orders'
        }, ] :
        [{
            icon: LayoutDashboard,
            label: 'Mi Panel',
            view: 'dashboard'
        }, {
            icon: Package,
            label: 'Catálogo de Productos',
            view: 'products'
        }, {
            icon: ShoppingBag,
            label: 'Mis Pedidos',
            view: 'orders'
        }, {
            icon: DollarSign,
            label: 'Mis Ganancias',
            view: 'earnings'
        }, {
            icon: Network,
            label: 'Mi Red',
            view: 'network'
        }, ];

    const {
        setCurrentView
    } = useView();

    const handleNavClick = (view) => {
        setCurrentView(view);
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };

    return ( <
        >
        <
        aside className = {
            `fixed top-0 left-0 h-full bg-white shadow-xl z-20 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none`
        } >
        <
        div className = "p-4 flex justify-between items-center" >
        <
        h2 className = "text-2xl font-bold text-blue-600" > MLM Platform < /h2> <
        button onClick = {
            () => setIsOpen(false)
        }
        className = "md:hidden" > < X className = "w-6 h-6" / > < /button> <
        /div> <
        nav className = "mt-6" > {
            navItems.map((item, index) => ( <
                button key = {
                    index
                }
                onClick = {
                    () => handleNavClick(item.view)
                }
                className = "w-full flex items-center gap-4 px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors" > {
                    React.createElement(item.icon, {
                        className: 'w-6 h-6'
                    })
                } <
                span > {
                    item.label
                } < /span> <
                /button>
            ))
        } <
        /nav> <
        div className = "absolute bottom-0 w-full p-4" >
        <
        button onClick = {
            logout
        }
        className = "w-full flex items-center gap-4 px-6 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors" >
        <
        LogOut className = "w-6 h-6" / > < span > Cerrar Sesión < /span> <
        /button> <
        /div> <
        /aside> {
            isOpen && < div onClick = {
                () => setIsOpen(false)
            }
            className = "fixed inset-0 bg-black opacity-50 z-10 md:hidden" > < /div>} <
            />
    );
};

const Header = ({
    setSidebarOpen
}) => {
    const {
        userData
    } = useAuth();
    if (!userData) return null;
    return ( <
        header className = "bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm p-4 flex justify-between items-center" >
        <
        button onClick = {
            () => setSidebarOpen(true)
        }
        className = "md:hidden" > < Menu className = "w-6 h-6" / > < /button> <
        div className = "hidden md:block" / >
        <
        div className = "flex items-center gap-4" >
        <
        div className = "text-right" >
        <
        p className = "font-semibold text-gray-800" > {
            userData.name
        } < /p> <
        p className = "text-sm text-gray-500" > {
            userData.email
        } < /p> <
        /div> <
        div className = {
            styles.avatar
        } > {
            userData.name.charAt(0)
        } < /div> <
        /div> <
        /header>
    );
};


// VIEW CONTEXT & MANAGEMENT ======================================================
const ViewContext = createContext(null);
const ViewProvider = ({
    children
}) => {
    const {
        isAdmin
    } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard');
    useEffect(() => {
        setCurrentView(isAdmin ? 'admin_dashboard' : 'dashboard');
    }, [isAdmin]);
    const value = {
        currentView,
        setCurrentView
    };
    return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}
const useView = () => useContext(ViewContext);

// MAIN CONTENT ROUTER ===========================================================
const MainContent = () => {
    const {
        currentView
    } = useView();
    const {
        isAdmin
    } = useAuth();

    if (isAdmin) {
        switch (currentView) {
            case 'admin_dashboard':
                return <AdminDashboard />;
            case 'admin_products':
                return <AdminProducts />;
            default:
                return <AdminDashboard />;
        }
    }

    switch (currentView) {
        case 'dashboard':
            return <UserDashboard />;
        case 'products':
            return <ProductCatalog />;
        case 'checkout':
            return <CheckoutPage />;
            // Otras vistas de usuario aquí
        default:
            return <UserDashboard />;
    }
}


// USER/VENDEDOR COMPONENTS =======================================================
const UserDashboard = () => {
    const {
        userData
    } = useAuth();
    if (!userData) return <LoadingSpinner />;

    const registrationLink = `https://your-platform.com/register?ref=${userData.referralCode}`;

    return ( <
        div className = "space-y-6" >
        <
        PageTitle title = "Mi Panel de Vendedor" / > { /* Aquí irían las StatCards con datos reales de Firestore */ } <
        div className = {
            styles.card
        } >
        <
        h3 className = "text-lg font-semibold text-gray-800 mb-4" > Tu Código de Registro < /h3> <
        p className = "text-gray-600 mb-4" > Comparte tu código o enlace para registrar nuevos miembros en tu red y ganar comisiones. < /p> <
        div className = "bg-gray-100 p-4 rounded-lg flex items-center justify-between" >
        <
        span className = "text-xl font-mono text-blue-600" > {
            userData.referralCode
        } < /span> <
        CopyToClipboard text = {
            userData.referralCode
        }
        /> <
        /div> <
        div className = "mt-4" >
        <
        label className = "text-sm text-gray-500" > Enlace de registro directo: < /label> <
        div className = "bg-gray-100 p-2 rounded-lg flex items-center justify-between" >
        <
        input type = "text"
        readOnly value = {
            registrationLink
        }
        className = "bg-transparent w-full text-sm text-gray-700" / >
        <
        CopyToClipboard text = {
            registrationLink
        }
        /> <
        /div> <
        /div> <
        /div> <
        /div>
    );
};

const ProductCard = ({
    product
}) => {
    const {
        addToCart
    } = useCart();
    const [added, setAdded] = useState(false);
    const handleAddToCart = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    }
    return ( <
        div className = {
            `${styles.card} flex flex-col`
        } >
        <
        img src = {
            product.imageUrl
        }
        onError = {
            (e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x400/cccccc/ffffff?text=Sin+Imagen"
            }
        }
        alt = {
            product.name
        }
        className = "w-full h-48 object-cover rounded-lg mb-4" / >
        <
        h3 className = "text-lg font-bold text-gray-800" > {
            product.name
        } < /h3> <
        p className = "text-sm text-gray-500 flex-grow mt-2 mb-4" > {
            product.description
        } < /p> <
        div className = "flex justify-between items-center mt-auto" >
        <
        div >
        <
        p className = "text-xs text-gray-500 line-through" > Público: Q {
            product.publicPrice.toFixed(2)
        } < /p> <
        p className = "text-xl font-bold text-blue-600" > Q {
            product.distributorPrice.toFixed(2)
        } < /p> <
        /div> <
        button onClick = {
            handleAddToCart
        }
        className = {
            `${styles.button} ${added ? 'bg-green-500 hover:bg-green-600' : ''}`
        }
        disabled = {
            added
        } > {
            added ? 'Agregado' : 'Añadir'
        } <
        /button> <
        /div> <
        /div>
    );
};

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const {
        cartItems
    } = useCart();

    useEffect(() => {
        const q = collection(db, "products");
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData = [];
            querySnapshot.forEach((doc) => {
                productsData.push({ ...doc.data(),
                    id: doc.id
                });
            });
            setProducts(productsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <LoadingSpinner />;

    return ( <
        div >
        <
        PageTitle title = "Catálogo de Productos" >
        <
        button onClick = {
            () => setIsCartOpen(true)
        }
        className = {
            `${styles.button} relative`
        } >
        <
        ShoppingBag className = "w-5 h-5" / >
        <
        span > Ver Carrito < /span> {
            cartItems.length > 0 && ( <
                span className = "absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" > {
                    cartItems.length
                } < /span>
            )
        } <
        /button> <
        /PageTitle> <
        div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" > {
            products.map(product => ( < ProductCard key = {
                product.id
            }
            product = {
                product
            }
            />))} <
            /div> <
            CartSidebar isOpen = {
                isCartOpen
            }
            setIsOpen = {
                setIsCartOpen
            }
            /> <
            /div>
    );
};


const CheckoutPage = () => { /* ... El código del Checkout se mantiene similar ... */ return <div > Checkout Page Placeholder < /div>};

// ADMIN COMPONENTS ==============================================================
const AdminDashboard = () => (
  <div className="max-w-full overflow-auto">
    <PageTitle title="Panel de Administrador" />
    <div className={`${styles.card} max-w-full`}>
      <p>Bienvenido al panel de control. Usa el menú para gestionar la plataforma.</p>
    </div>
  </div>
);

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        publicPrice: '',
        distributorPrice: '',
        stock: '',
        imageUrl: ''
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({ ...doc.data(),
                id: doc.id
            }));
            setProducts(productsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleInputChange = (e) => {
        const {
            name,
            value
        } = e.target;
        setNewProduct(prev => ({ ...prev,
            [name]: value
        }));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.publicPrice || !newProduct.distributorPrice) {
            alert("Nombre y precios son requeridos.");
            return;
        }
        const productData = {
            ...newProduct,
            publicPrice: parseFloat(newProduct.publicPrice),
            distributorPrice: parseFloat(newProduct.distributorPrice),
            stock: parseInt(newProduct.stock, 10),
        };
        try {
            await addDoc(collection(db, "products"), productData);
            setShowForm(false);
            setNewProduct({
                name: '',
                description: '',
                publicPrice: '',
                distributorPrice: '',
                stock: '',
                imageUrl: ''
            });
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };


    return ( <
        div >
        <
        PageTitle title = "Gestionar Productos" >
        <
        button onClick = {
            () => setShowForm(!showForm)
        }
        className = {
            styles.button
        } >
        <
        PlusCircle className = "w-5 h-5" / > {
            showForm ? 'Cerrar' : 'Añadir Producto'
        } <
        /button> <
        /PageTitle>

        {
            showForm && ( <
                div className = {
                    `${styles.card} mb-6`
                } >
                <
                form onSubmit = {
                    handleAddProduct
                }
                className = "space-y-4" >
                <
                h3 className = "text-xl font-semibold" > Nuevo Producto < /h3> <
                div > < label className = {
                    styles.label
                } > Nombre del Producto < /label><input type="text" name="name" value={newProduct.name} onChange={handleInputChange} className={styles.input} required /></div >
                <
                div > < label className = {
                    styles.label
                } > Descripción < /label><textarea name="description" value={newProduct.description} onChange={handleInputChange} className={styles.input} /></div >
                <
                div className = "grid grid-cols-1 md:grid-cols-2 gap-4" >
                <
                div > < label className = {
                    styles.label
                } > Precio al Público(Q) < /label><input type="number" name="publicPrice" value={newProduct.publicPrice} onChange={handleInputChange} className={styles.input} required /></div >
                <
                div > < label className = {
                    styles.label
                } > Precio Distribuidor(Q) < /label><input type="number" name="distributorPrice" value={newProduct.distributorPrice} onChange={handleInputChange} className={styles.input} required /></div >
                <
                /div> <
                div className = "grid grid-cols-1 md:grid-cols-2 gap-4" >
                <
                div > < label className = {
                    styles.label
                } > Stock < /label><input type="number" name="stock" value={newProduct.stock} onChange={handleInputChange} className={styles.input} /></div >
                <
                div > < label className = {
                    styles.label
                } > URL de la Imagen < /label><input type="text" name="imageUrl" value={newProduct.imageUrl} onChange={handleInputChange} className={styles.input} /></div >
                <
                /div> <
                button type = "submit"
                className = {
                    styles.button
                } > Guardar Producto < /button> <
                /form> <
                /div>
            )
        }

        <
        div className = {
            `${styles.card} p-0`
        } >
        <
        div className = "overflow-x-auto" > {
            loading ? < LoadingSpinner / > : ( <
                table className = "w-full text-left" >
                <
                thead >
                <
                tr className = "border-b bg-gray-50" >
                <
                th className = "p-4 font-semibold" > Producto < /th> <
                th className = "p-4 font-semibold" > Precio Distribuidor < /th> <
                th className = "p-4 font-semibold" > Stock < /th> <
                th className = "p-4 font-semibold" > Acciones < /th> <
                /tr> <
                /thead> <
                tbody > {
                    products.map(p => ( <
                        tr key = {
                            p.id
                        }
                        className = "border-b hover:bg-gray-50" >
                        <
                        td className = "p-4" > {
                            p.name
                        } < /td> <
                        td className = "p-4" > Q{
                            p.distributorPrice.toFixed(2)
                        } < /td> <
                        td className = "p-4" > {
                            p.stock
                        } < /td> <
                        td className = "p-4" > < button className = "text-red-500 hover:text-red-700" > < Trash2 className = "w-5 h-5" / > < /button></td >
                        <
                        /tr>
                    ))
                } <
                /tbody> <
                /table>
            )
        } <
        /div> <
        /div> <
        /div>
    );
};

// LOGIN/AUTH COMPONENTS ==========================================================
const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    return ( <
        div className = "flex items-center justify-center min-h-screen bg-gray-100" >
        <
        div className = "p-8 bg-white rounded-2xl shadow-xl w-full max-w-md" >
        <
        h1 className = "text-3xl font-bold text-blue-600 mb-2 text-center" > {
            isLogin ? "Iniciar Sesión" : "Crear Cuenta"
        } <
        /h1> {
            isLogin ? < LoginForm / > : < RegisterForm / >
        } <
        button onClick = {
            () => setIsLogin(!isLogin)
        }
        className = "w-full mt-4 text-center text-sm text-blue-600 hover:underline" > {
            isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"
        } <
        /button> <
        /div> <
        /div>
    );
};

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError("Error al iniciar sesión. Verifica tus credenciales.");
            console.error(err);
        }
    };

    return ( <
        form onSubmit = {
            handleLogin
        }
        className = "space-y-4" > {
            error && < p className = "text-red-500 text-sm" > {
                error
            } < /p>} <
            div >
            <
            label className = {
                styles.label
            } > Correo Electrónico < /label> <
            input type = "email"
            value = {
                email
            }
            onChange = {
                e => setEmail(e.target.value)
            }
            className = {
                styles.input
            }
            required / >
            <
            /div> <
            div >
            <
            label className = {
                styles.label
            } > Contraseña < /label> <
            input type = "password"
            value = {
                password
            }
            onChange = {
                e => setPassword(e.target.value)
            }
            className = {
                styles.input
            }
            required / >
            <
            /div> <
            button type = "submit"
            className = {
                `${styles.button} w-full`
            } > Iniciar Sesión < /button> <
            /form>
    );
};

const RegisterForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Extraer código de referido de la URL si existe
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
            setReferralCode(refCode);
        }
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!referralCode || !name) {
            setError("Nombre y código de registro son obligatorios.");
            return;
        }

        // 1. Verificar que el código de referido es válido
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("referralCode", "==", referralCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setError("El código de referido no es válido.");
            return;
        }

        const sponsorDoc = querySnapshot.docs[0];
        const sponsorId = sponsorDoc.id;

        // 2. Crear el nuevo usuario en Firebase Auth
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            // 3. Crear un nuevo código de referido para el nuevo usuario
            const newReferralCode = `${name.split(' ')[0].toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

            // 4. Guardar los datos del usuario en Firestore
            await setDoc(doc(db, "users", newUser.uid), {
                name: name,
                email: email,
                sponsorId: sponsorId,
                referralCode: newReferralCode,
                role: 'vendedor',
                createdAt: new Date(),
            });

        } catch (err) {
            setError("Error al registrar la cuenta. El correo ya podría estar en uso.");
            console.error(err);
        }
    };

    return ( <
        form onSubmit = {
            handleRegister
        }
        className = "space-y-4" > {
            error && < p className = "text-red-500 text-sm" > {
                error
            } < /p>} <
            div > < label className = {
                styles.label
            } > Nombre Completo < /label><input type="text" value={name} onChange={e => setName(e.target.value)} className={styles.input} required /></div >
            <
            div > < label className = {
                styles.label
            } > Código de Registro de tu Patrocinador < /label><input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value)} className={styles.input} required /></div >
            <
            div > < label className = {
                styles.label
            } > Correo Electrónico < /label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={styles.input} required /></div >
            <
            div > < label className = {
                styles.label
            } > Contraseña < /label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} required /></div >
            <
            button type = "submit"
            className = {
                `${styles.button} w-full`
            } > Registrarse < /button> <
            /form>
    );
};


// MAIN APP COMPONENT =============================================================
const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <ViewProvider>
      <CartProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          <div className="flex-1 flex flex-col overflow-hidden max-w-full">
            <Header setSidebarOpen={setSidebarOpen} />
            <main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-100 p-6 max-w-full">
              <MainContent />
            </main>
          </div>
        </div>
      </CartProvider>
    </ViewProvider>
  );
};

export default function App() {
    return (
        <AuthProvider>
            <AppWrapper />
        </AuthProvider>
    );
}

const AppWrapper = () => {
    const {
        isAuthenticated,
        loading
    } = useAuth();

    if (loading) {
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
    }

    if (!isAuthenticated) {
        return <AuthPage />;
    }

    return <AppContent />;
}
