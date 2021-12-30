// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyB2x7zDAsz5zoC6jOoqrpnP7PRLYOtZk9s",
//   authDomain: "pong-e692c.firebaseapp.com",
//   projectId: "pong-e692c",
//   storageBucket: "pong-e692c.appspot.com",
//   messagingSenderId: "678084788906",
//   appId: "1:678084788906:web:e5b4c82be06edd6eccc6d3",
//   measurementId: "G-Y4DJ1W4J6T"
// };

// export async function initFirebase() {
//   if (typeof window !== "undefined") {
//     // You need to use firebase/app for the client side
//     const fb = (await import("firebase/app")).default;
//     await import("firebase/auth");
//     await import("firebase/firestore");
//     fb.initializeApp(firebaseConfig);
//     return;
//   }

//   const fb: any = await import("firebase");
//   if (fb.apps.length == 0) {
//     fb.initializeApp(firebaseConfig);
//     return;
//   }
// }