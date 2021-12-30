<script lang="ts" context="module">
	// Import the functions you need from the SDKs you need
	import { initializeApp, getApp, getApps } from 'firebase/app';
	import { collection, getDocs, getFirestore } from 'firebase/firestore';
	import { getAuth, onAuthStateChanged } from 'firebase/auth';
	// import { initializeAnalytics, getAnalytics } from "@firebase/analytics";

	const firebaseConfig = {
		apiKey: 'AIzaSyB2x7zDAsz5zoC6jOoqrpnP7PRLYOtZk9s',
		authDomain: 'pong-e692c.firebaseapp.com',
		projectId: 'pong-e692c',
		storageBucket: 'pong-e692c.appspot.com',
		messagingSenderId: '678084788906',
		appId: '1:678084788906:web:e5b4c82be06edd6eccc6d3',
		measurementId: 'G-Y4DJ1W4J6T'
	};

	// Init firebase app
	const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

	// Init services
	const db = getFirestore(app);
	const auth = getAuth(app);
	// console.log('db', db);
	// console.log('auth', auth);
	// const analytics = getAnalytics(app);

  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


	const colRef = collection(db, 'books');
	export async function load({ page, fetch, session, context }) {
    // TODO: load gets called twice, one on deployment to server and once on page load
    console.log('sleeping started')
    await sleep(10000)
    console.log('sleeping ended')
		let snapshot = await getDocs(colRef)
    let data = snapshot.docs.map((doc) => doc.data())
		console.log(data);
    console.log('data fetched', data)
		return {
			props: {
				data: data
			}
		};
  }

	onAuthStateChanged(auth, (user) => {
		if (user === null) {
			console.log('No user');
		} else {
			console.log(`${user} logged in`);
		}
	});
</script>



<script lang="ts">
  export let data: {title: string; author: string}[] = [];
</script>


<slot />
<ul>
	{#each data as row}
		<li>Title: {row.title}, Author: {row.author}</li>
	{/each}
</ul>
