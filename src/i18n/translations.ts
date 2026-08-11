import type { LanguageCode } from './languages';
export type TranslationKey =
  | 'nav.products'
  | 'nav.categories'
  | 'nav.about'
  | 'nav.searchPlaceholder'
  | 'nav.login'
  | 'nav.cart'
  | 'language.youAreHere'
  | 'language.chooseLanguage'
  | 'language.language'
  | 'language.currency'
  | 'language.continue'
  | 'language.deliverTo'
  | 'language.specifyLocation'
  | 'language.shippingNote'
  | 'language.countryRegion'
  | 'language.postalCode'
  | 'language.postalPlaceholder'
  | 'language.checkingLocation'
  | 'language.locationVerified'
  | 'language.invalidPostal'
  | 'common.save'
  | 'home.exploreProducts'
  | 'home.ourStory'
  | 'home.featuredTitle'
  | 'home.featuredSubtitle'
  | 'home.viewAllProducts'
  | 'home.trustQualityTitle'
  | 'home.trustQualityDesc'
  | 'home.trustGlobalTitle'
  | 'home.trustCustomTitle'
  | 'home.trustCustomDesc'
  | 'home.footerTagline'
  | 'footer.quickLinks'
  | 'footer.contactUs'
  | 'footer.contactLink'
  | 'footer.privacy'
  | 'footer.terms'
  | 'footer.allRights'
  | 'product.allProducts'
  | 'product.showingCount'
  | 'product.searchPlaceholder'
  | 'product.filter'
  | 'product.needQuoteTitle'
  | 'product.needQuoteDesc'
  | 'product.whatsapp'
  | 'product.email'
  | 'product.call'
  | 'product.openForm'
  | 'product.categories'
  | 'product.allCategories'
  | 'product.submitEnquiry'
  | 'product.noProducts'
  | 'product.clearFilters'
  | 'enquiry.title'
  | 'enquiry.selectedProduct'
  | 'enquiry.selectProduct'
  | 'enquiry.requirement'
  | 'enquiry.requirementPlaceholder'
  | 'enquiry.requirementHint'
  | 'enquiry.fullName'
  | 'enquiry.email'
  | 'enquiry.phone'
  | 'enquiry.company'
  | 'enquiry.location'
  | 'enquiry.quantity'
  | 'enquiry.message'
  | 'enquiry.submitSuccess'
  | 'enquiry.submitError'
  | 'enquiry.selectProductWarning'
  | 'enquiry.cancel'
  | 'enquiry.submitting'
  | 'enquiry.submit'
  | 'cart.emptyTitle'
  | 'cart.emptyDesc'
  | 'cart.browseProducts'
  | 'cart.title'
  | 'cart.orderSummary'
  | 'cart.subtotal'
  | 'cart.gst'
  | 'cart.shipping'
  | 'cart.shippingNote'
  | 'cart.total'
  | 'cart.checkout'
  | 'cart.secureTitle'
  | 'cart.secureDesc'
  | 'checkout.title'
  | 'checkout.detailsTitle'
  | 'checkout.mobileLabel'
  | 'checkout.mobilePlaceholder'
  | 'checkout.gstLabel'
  | 'checkout.gstPlaceholder'
  | 'checkout.pinLabel'
  | 'checkout.pinPlaceholder'
  | 'checkout.shippingTitle'
  | 'checkout.summaryTitle'
  | 'checkout.itemsCount'
  | 'checkout.shippingCharges'
  | 'checkout.additionalCharges'
  | 'checkout.total'
  | 'checkout.placeRfq'
  | 'checkout.savingQuote'
  | 'checkout.saveError'
  | 'checkout.backToCart'
  | 'checkout.emptyTitle'
  | 'checkout.emptyDesc'
  | 'checkout.browseProducts'
  | 'login.welcome'
  | 'login.create'
  | 'login.welcomeSub'
  | 'login.createSub'
  | 'login.fullName'
  | 'login.email'
  | 'login.password'
  | 'login.forgot'
  | 'login.signIn'
  | 'login.signUp'
  | 'login.switchToSignUp'
  | 'login.switchToSignIn'
  | 'login.loggedInAs'
  | 'login.logout'
  | 'login.processing'
  | 'login.authError'
  | 'productDetail.loading'
  | 'productDetail.notFound'
  | 'productDetail.breadcrumbHome'
  | 'productDetail.breadcrumbProducts'
  | 'productDetail.astm'
  | 'productDetail.uns'
  | 'productDetail.dimensions'
  | 'productDetail.availability'
  | 'productDetail.inStock'
  | 'productDetail.outOfStock'
  | 'productDetail.addToCart'
  | 'productDetail.requestQuote'
  | 'productDetail.quality'
  | 'productDetail.shipping'
  | 'productDetail.returns'
  | 'productDetail.addedToCart'
  | 'productDetail.viewCart'
  | 'productDetail.closeToast'
  | 'productDetail.techSpecs'
  | 'productDetail.applications'
  | 'productDetail.shippingInfo'
  | 'productDetail.techDescription'
  | 'productDetail.bullet1'
  | 'productDetail.bullet2'
  | 'productDetail.bullet3'
  | 'productDetail.bullet4'
  | 'chatbot.title'
  | 'chatbot.greeting'
  | 'chatbot.error'
  | 'chatbot.connectingError'
  | 'chatbot.placeholder'
  | 'cookies.title'
  | 'cookies.desc'
  | 'cookies.accept'
  | 'cookies.decline';


const enTranslations: Record<TranslationKey, string> = {
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.about': 'About',
    'nav.searchPlaceholder': 'Search by Name, ASTM, UNS, size, price...',
    'nav.login': 'Login',
    'nav.cart': 'Cart',
    'language.youAreHere': 'You are here',
    'language.chooseLanguage': 'Choose language',
    'language.language': 'language:',
    'language.currency': 'currency:',
    'language.continue': 'continue',
    'language.deliverTo': 'Deliver to',
    'language.specifyLocation': 'Specify your location',
    'language.shippingNote': 'Shipping options and fees vary based on your location.',
    'language.countryRegion': 'Country / Region',
    'language.postalCode': 'ZIP / Postal code',
    'language.postalPlaceholder': 'Enter ZIP or postal code',
    'language.checkingLocation': 'Checking location...',
    'language.locationVerified': 'Location verified.',
    'language.invalidPostal': 'Invalid postal code for {{country}}.',
    'common.save': 'Save',
    'home.exploreProducts': 'Explore Products',
    'home.ourStory': 'Our Story',
    'home.featuredTitle': 'Featured Inventory',
    'home.featuredSubtitle': 'Our most popular industrial components, ready for export.',
    'home.viewAllProducts': 'View All Products',
    'home.trustQualityTitle': 'Certified Quality',
    'home.trustQualityDesc': 'ISO 9001:2015 certified processes ensuring every product meets international ASTM/ASME standards.',
    'home.trustGlobalTitle': 'Global Export',
    'home.trustCustomTitle': 'Custom Fabrication',
    'home.trustCustomDesc': 'In-house machining and cutting facilities to provide components exactly to your project specifications.',
    'home.footerTagline': 'RAMANI STEEL HOUSE',
    'footer.quickLinks': 'Quick Links',
    'footer.contactUs': 'Contact Us',
    'footer.contactLink': 'Contact',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.allRights': '� 2026  Industrial Solutions. All rights reserved.',
    'product.allProducts': 'All Products',
    'product.showingCount': 'Showing {{count}} industrial components',
    'product.searchPlaceholder': 'Search Name, ASTM, UNS, dimensions, price...',
    'product.filter': 'Filter',
    'product.needQuoteTitle': 'Need a quick quote?',
    'product.needQuoteDesc': 'Reach our sales team instantly on WhatsApp, email, or send a detailed product enquiry form.',
    'product.whatsapp': 'WhatsApp',
    'product.email': 'Email',
    'product.call': 'Call',
    'product.openForm': 'Open Form',
    'product.categories': 'Categories',
    'product.allCategories': 'All Categories',
    'product.submitEnquiry': 'Get Best Price',
    'product.noProducts': 'No products found matching your criteria.',
    'product.clearFilters': 'Clear all filters',
    'enquiry.title': 'Custom Enquiry',
    'enquiry.selectedProduct': 'Prefilled product: {{product}}',
    'enquiry.selectProduct': 'Select a product',
    'enquiry.requirement': 'Product Requirement',
    'enquiry.requirementPlaceholder': 'Grade, size, thickness, quantity, delivery city, etc.',
    'enquiry.requirementHint': 'Tell us what you need below.',
    'enquiry.fullName': 'Full Name',
    'enquiry.email': 'Email',
    'enquiry.phone': 'Phone Number',
    'enquiry.company': 'Company Name',
    'enquiry.location': 'Location',
    'enquiry.quantity': 'Required Quantity',
    'enquiry.message': 'Message',
    'enquiry.submitSuccess': 'Enquiry submitted successfully. Our team will contact you shortly.',
    'enquiry.submitError': 'Unable to submit enquiry. Please try again.',
    'enquiry.selectProductWarning': 'Please select a product before submitting.',
    'enquiry.cancel': 'Cancel',
    'enquiry.submitting': 'Submitting...',
    'enquiry.submit': 'Submit Enquiry',
    'cart.emptyTitle': 'Your cart is empty',
    'cart.emptyDesc': "Looks like you haven't added any industrial components yet.",
    'cart.browseProducts': 'Browse Products',
    'cart.title': 'Shopping Cart',
    'cart.orderSummary': 'Order Summary',
    'cart.subtotal': 'Subtotal',
    'cart.gst': 'GST (18%)',
    'cart.shipping': 'Shipping',
    'cart.shippingNote': 'Calculated at next step',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.secureTitle': 'Secure Checkout',
    'cart.secureDesc': 'Your transaction is protected by industry-standard encryption.',
    'checkout.title': 'Checkout',
    'checkout.detailsTitle': 'Checkout Details',
    'checkout.mobileLabel': 'Registered Mobile Number',
    'checkout.mobilePlaceholder': 'Enter mobile number',
    'checkout.gstLabel': 'GST NO (Optional)',
    'checkout.gstPlaceholder': 'Enter GST number',
    'checkout.pinLabel': 'Delivery Pin Code',
    'checkout.pinPlaceholder': 'Enter pin code',
    'checkout.shippingTitle': 'Shipping',
    'checkout.summaryTitle': 'Quote Summary',
    'checkout.itemsCount': 'Subtotal ({{count}} Items)',
    'checkout.shippingCharges': 'Shipping',
    'checkout.additionalCharges': 'Additional charges apply',
    'checkout.total': 'Total',
    'checkout.placeRfq': 'Place RFQ on WhatsApp',
    'checkout.savingQuote': 'Saving Quote...',
    'checkout.saveError': 'Could not save your quote details. Your WhatsApp request will still open.',
    'checkout.backToCart': 'Back to cart',
    'checkout.emptyTitle': 'Your cart is empty',
    'checkout.emptyDesc': 'Add items to your cart to continue checkout.',
    'checkout.browseProducts': 'Browse Products',
    'login.welcome': 'Welcome Back',
    'login.create': 'Create Account',
    'login.welcomeSub': 'Access your industrial dashboard',
    'login.createSub': 'Join the  marketplace',
    'login.fullName': 'Full Name',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.forgot': 'Forgot?',
    'login.signIn': 'Sign In',
    'login.signUp': 'Sign Up',
    'login.switchToSignUp': "Don't have an account?",
    'login.switchToSignIn': 'Already have an account?',
    'login.loggedInAs': 'Signed in as {{email}}',
    'login.logout': 'Logout',
    'login.processing': 'Processing...',
    'login.authError': 'Unable to complete sign in right now. Please try again.',
    'productDetail.loading': 'Loading product...',
    'productDetail.notFound': 'Product not found.',
    'productDetail.breadcrumbHome': 'Home',
    'productDetail.breadcrumbProducts': 'Products',
    'productDetail.astm': 'ASTM Standard',
    'productDetail.uns': 'UNS Number',
    'productDetail.dimensions': 'Dimensions',
    'productDetail.availability': 'Availability',
    'productDetail.inStock': 'In Stock',
    'productDetail.outOfStock': 'Out of Stock',
    'productDetail.addToCart': 'Add to Cart',
    'productDetail.requestQuote': 'Request Bulk Quote',
    'productDetail.quality': 'Quality Guaranteed',
    'productDetail.shipping': 'Global Shipping',
    'productDetail.returns': 'Easy Returns',
    'productDetail.addedToCart': 'Added to cart',
    'productDetail.viewCart': 'View cart',
    'productDetail.closeToast': 'Close',
    'productDetail.techSpecs': 'Technical Specifications',
    'productDetail.applications': 'Applications',
    'productDetail.shippingInfo': 'Shipping Info',
    'productDetail.techDescription': 'This {{product}} is manufactured following strict {{astm}} guidelines. It features excellent mechanical properties and superior corrosion resistance, making it ideal for chemical processing, oil & gas, and marine environments.',
    'productDetail.bullet1': 'High tensile strength and durability',
    'productDetail.bullet2': 'Precise dimensional accuracy',
    'productDetail.bullet3': 'Smooth surface finish with protective coating options',
    'productDetail.bullet4': 'Full material traceability with MTC (Mill Test Certificate)',
    'chatbot.title': 'Ramani Steel House AI',
    'chatbot.greeting': 'Hello! I am your Ramani Steel House assistant. Ask me about our nickel strips, alloys, or export orders.',
    'chatbot.error': 'Sorry, I am having trouble connecting.',
    'chatbot.connectingError': 'Error connecting to AI assistant.',
    'chatbot.placeholder': 'Ask about nickel strips, pricing, export...',
    'cookies.title': 'We use cookies',
    'cookies.desc': 'Cookies help us deliver product recommendations, improve analytics, and remember your language preference.',
    'cookies.accept': 'Accept',
    'cookies.decline': 'Decline'
  };

const zhTranslations: Record<TranslationKey, string> = {
    'nav.products': '??',
    'nav.categories': '??',
    'nav.about': '????',
    'nav.searchPlaceholder': '????ASTM?UNS????????...',
    'nav.login': '??',
    'nav.cart': '???',
    'language.youAreHere': '????',
    'language.chooseLanguage': '????',
    'language.language': '??:',
    'language.currency': '??:',
    'language.continue': '??',
    'language.deliverTo': '????',
    'language.specifyLocation': '???????',
    'language.shippingNote': '??????????????????',
    'language.countryRegion': '???? / ??',
    'language.postalCode': '?? / ???',
    'language.postalPlaceholder': '????? / ???',
    'language.checkingLocation': '??????...',
    'language.locationVerified': '??????',
    'language.invalidPostal': '{{country}} ???????',
    'common.save': '??',
    'home.exploreProducts': '????',
    'home.ourStory': '?????',
    'home.featuredTitle': '????',
    'home.featuredSubtitle': '?????????,?????',
    'home.viewAllProducts': '??????',
    'home.trustQualityTitle': '????',
    'home.trustQualityDesc': '?? ISO 9001:2015 ????,???????? ASTM/ASME ???',
    'home.trustGlobalTitle': '????',
    'home.trustCustomTitle': '????',
    'home.trustCustomDesc': '??????????,??????????',
    'home.footerTagline': 'Ramani Steel House',
    'footer.quickLinks': '????',
    'footer.contactUs': '????',
    'footer.contactLink': '??',
    'footer.privacy': '????',
    'footer.terms': '????',
    'footer.allRights': '� 2026 Ramani Steel House. All rights reserved.',
    'product.allProducts': '????',
    'product.showingCount': '?? {{count}} ?????',
    'product.searchPlaceholder': '?????ASTM?UNS??????...',
    'product.filter': '??',
    'product.needQuoteTitle': '???????',
    'product.needQuoteDesc': '?? WhatsApp??????????????????????',
    'product.whatsapp': 'WhatsApp',
    'product.email': '????',
    'product.call': '拨打电话',
    'product.openForm': '????',
    'product.categories': '??',
    'product.allCategories': '????',
    'product.submitEnquiry': '????',
    'product.noProducts': '???????????',
    'product.clearFilters': '??????',
    'enquiry.title': '??????',
    'enquiry.selectedProduct': '????:{{product}}',
    'enquiry.selectProduct': '????',
    'enquiry.requirement': '????',
    'enquiry.requirementPlaceholder': '??????,????,????,????',
    'enquiry.requirementHint': '??????????',
    'enquiry.fullName': '??',
    'enquiry.email': '??',
    'enquiry.phone': '??',
    'enquiry.company': '????',
    'enquiry.location': '???',
    'enquiry.quantity': '????',
    'enquiry.message': '??',
    'enquiry.submitSuccess': '???????????????????',
    'enquiry.submitError': '????,????',
    'enquiry.selectProductWarning': '???????',
    'enquiry.cancel': '??',
    'enquiry.submitting': '????...',
    'enquiry.submit': '????',
    'cart.emptyTitle': '?????',
    'cart.emptyDesc': '????????????',
    'cart.browseProducts': '????',
    'cart.title': '???',
    'cart.orderSummary': '????',
    'cart.subtotal': '??',
    'cart.gst': 'GST (18%)',
    'cart.shipping': '??',
    'cart.shippingNote': '?????',
    'cart.total': '??',
    'cart.checkout': '??',
    'cart.secureTitle': '????',
    'cart.secureDesc': '??????????????',
    'checkout.title': '????',
    'checkout.detailsTitle': '??????',
    'checkout.mobileLabel': '??????',
    'checkout.mobilePlaceholder': '????',
    'checkout.gstLabel': 'GST ?? (??)',
    'checkout.gstPlaceholder': '?? GST ??',
    'checkout.pinLabel': '????',
    'checkout.pinPlaceholder': '????',
    'checkout.shippingTitle': '??',
    'checkout.summaryTitle': '????',
    'checkout.itemsCount': '?? ({{count}} ??)',
    'checkout.shippingCharges': '??',
    'checkout.additionalCharges': '????????',
    'checkout.total': '??',
    'checkout.placeRfq': '?? WhatsApp ?????',
    'checkout.savingQuote': '????...',
    'checkout.saveError': '????????? WhatsApp ?????',
    'checkout.backToCart': '?? ?',
    'checkout.emptyTitle': '?????',
    'checkout.emptyDesc': '??????????????',
    'checkout.browseProducts': '????',
    'login.welcome': '????',
    'login.create': '????',
    'login.welcomeSub': '?????????',
    'login.createSub': '?? Ramani Steel House??',
    'login.fullName': '??',
    'login.email': '????',
    'login.password': '??',
    'login.forgot': '?????',
    'login.signIn': '??',
    'login.signUp': '??',
    'login.switchToSignUp': '??????',
    'login.switchToSignIn': '?????',
    'login.loggedInAs': '???? {{email}}',
    'login.logout': '??',
    'login.processing': '????...',
    'login.authError': '????????????????',
    'productDetail.loading': '??????...',
    'productDetail.notFound': '??????',
    'productDetail.breadcrumbHome': '??',
    'productDetail.breadcrumbProducts': '??',
    'productDetail.astm': 'ASTM ??',
    'productDetail.uns': 'UNS ??',
    'productDetail.dimensions': '??',
    'productDetail.availability': '??',
    'productDetail.inStock': '??',
    'productDetail.outOfStock': '??',
    'productDetail.addToCart': '?????',
    'productDetail.requestQuote': '??????',
    'productDetail.quality': '????',
    'productDetail.shipping': '????',
    'productDetail.returns': '????',
    'productDetail.addedToCart': '?????',
    'productDetail.viewCart': '?? ?',
    'productDetail.closeToast': '??',
    'productDetail.techSpecs': '????',
    'productDetail.applications': '??',
    'productDetail.shippingInfo': '????',
    'productDetail.techDescription': '? {{product}} ????? {{astm}} ????,??????????????,??????????????',
    'productDetail.bullet1': '?????????',
    'productDetail.bullet2': '???????',
    'productDetail.bullet3': '???????????',
    'productDetail.bullet4': '?? MTC(????)?????',
    'chatbot.title': 'Ramani Steel House AI',
    'chatbot.greeting': '??!????  ???????????????????',
    'chatbot.error': '??,???????',
    'chatbot.connectingError': '?? AI ??????',
    'chatbot.placeholder': '????...',
    'cookies.title': '???? Cookies',
    'cookies.desc': 'Cookies ???????????????????????',
    'cookies.accept': '??',
    'cookies.decline': '??'
  };

export const translations: Record<LanguageCode, Record<TranslationKey, string>> = {
  en: enTranslations,
  zh: zhTranslations,
  nl: enTranslations,
  fr: enTranslations,
  de: enTranslations,
  it: enTranslations,
  es: enTranslations,
  tr: enTranslations,
  hi: enTranslations,
  pt: enTranslations,
  ru: enTranslations,
  ko: enTranslations,
  ja: enTranslations,
  ar: enTranslations,
  th: enTranslations,
  vi: enTranslations,
  he: enTranslations,
  id: enTranslations,
};
