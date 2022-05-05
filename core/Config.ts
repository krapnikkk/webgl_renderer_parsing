// export const largeUI: boolean = false;
// export const transparentBackground: boolean = false;
// export const noUserInterface: boolean = false;
const marmoset = {
    largeUI: false,
    transparentBackground: false,
    noUserInterface: false,
    dataLocale: (0 == window.location.protocol.indexOf("https") ? "https:" : "http:") + "//viewer.marmoset.co/main/data/",
}
export default marmoset;