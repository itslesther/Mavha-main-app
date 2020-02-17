// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  APIURL: 'http://localhost:8080',
  firebase: {
    apiKey: "AIzaSyCCYXtKw-yqqoo0KTGIrOv42pA1PDqueEM",
    authDomain: "mavha-test.firebaseapp.com",
    databaseURL: "https://mavha-test.firebaseio.com",
    projectId: "mavha-test",
    storageBucket: "mavha-test.appspot.com",
    messagingSenderId: "660885965084",
    appId: "1:660885965084:web:2d2ebe4d1b30c94d3812d9",
    measurementId: "G-7QLBL15092"
  },
  tinymceApiKey: 'u8a7whauucf243roh1yc6pompbwdtolydkdk3xnl3ypmmue5',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
