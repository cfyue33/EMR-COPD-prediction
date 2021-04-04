//adapted from the cerner smart on fhir guide. updated to utalize client.js v2 library and FHIR R4

// helper function to process fhir resource to get the patient name.
function getPatientName(pt) {
  if (pt.name) {
    var names = pt.name.map(function(name) {
      return name.given.join(" ") + " " + name.family;
    });
    return names.join(" / ")
  } else {
    return "anonymous";
  }
}

// display the patient name gender and dob in the index page
function displayPatient(pt) {
  document.getElementById('patient_name').innerHTML = getPatientName(pt);
  document.getElementById('gender').innerHTML = pt.gender;
  document.getElementById('dob').innerHTML = pt.birthDate;
}

function genderCal(pt) {
  var genderScore = 0.5;  //if unknown or other, use 0.5 as the age score
  if (pt.gender == 'male') {
      genderScore = 1; 
  } else if (pt.gender == 'female') {
	  genderScore = 0;
  }
  console.log(genderScore);
  return genderScore;  
}  
 
function ageCal(pt) { 
  if (pt.birthDate.length >= 4) {
	  var birthYear = pt.birthDate.slice(0,4);
	  if (pt.birthDate.length >= 7) {
		  var birthMonth = pt.birthDate.slice(5,7);
		  if (pt.birthDate.length >= 10) {
			  var birthDay = pt.birthDate.slice(8);
		  }
	  } 
  } else {
	  alert("No dob info.: COPD prediction cannot be done!");
  }
  var ageScore = calculate_age(new Date(birthYear, birthMonth, birthDay));
  console.log(ageScore);
  return ageScore;
}

// age calculation; source of code: https://www.w3resource.com/javascript-exercises/javascript-date-exercise-18.php
function calculate_age(dob) { 
    var diff_ms = Date.now() - dob.getTime();
    var age_dt = new Date(diff_ms); 
  
    return Math.abs(age_dt.getUTCFullYear() - 1970);
}
  
function smokingCal () {
  var smokingScore = 0;  //initialize smoking score
  var smokingStatus = $("input[name=choice]");
  var checkedValue = smokingStatus.filter(":checked").val();
  if (checkedValue == "activeSmoker") {
	  smokingScore = 3;
  }	else if (checkedValue == "exSmoker") {
	  smokingScore = 2;
  }	else if (checkedValue == "nonSmoker") {
	  smokingScore = 1;
  }	  
  console.log(smokingScore);
  return smokingScore;
}

function copdPredict (gender, age, smoking) {
	var prob = -0.719518 + 0.099568*gender + 0.017798*age + 0.065001*smoking;
    console.log(prob);
    return prob;	
}

//function to display list of medications
function displayMedication(meds) {
  med_list.innerHTML += "<li> " + meds + "</li>";
}

//helper function to get quanity and unit from an observation resoruce.
function getQuantityValueAndUnit(ob) {
  if (typeof ob != 'undefined' &&
    typeof ob.valueQuantity != 'undefined' &&
    typeof ob.valueQuantity.value != 'undefined' &&
    typeof ob.valueQuantity.unit != 'undefined') {
    return Number(parseFloat((ob.valueQuantity.value)).toFixed(2)) + ' ' + ob.valueQuantity.unit;
  } else {
    return undefined;
  }
}

// helper function to get both systolic and diastolic bp
function getBloodPressureValue(BPObservations, typeOfPressure) {
  var formattedBPObservations = [];
  BPObservations.forEach(function(observation) {
    var BP = observation.component.find(function(component) {
      return component.code.coding.find(function(coding) {
        return coding.code == typeOfPressure;
      });
    });
    if (BP) {
      observation.valueQuantity = BP.valueQuantity;
      formattedBPObservations.push(observation);
    }
  });

  return getQuantityValueAndUnit(formattedBPObservations[0]);
}

// create a patient object to initalize the patient
function defaultPatient() {
  return {
    height: {
      value: ''
    },
    weight: {
      value: ''
    },
    sys: {
      value: ''
    },
    dia: {
      value: ''
    },
    ldl: {
      value: ''
    },
    hdl: {
      value: ''
    },
    note: 'No Annotation',
  };
}


//function to display the observation values you will need to update this
function displayObservation(obs) {
  hdl.innerHTML = obs.hdl;
  ldl.innerHTML = obs.ldl;
  sys.innerHTML = obs.sys;
  dia.innerHTML = obs.dia;
  height.innerHTML = obs.height;  
  weight.innerHTML = obs.weight;
}

//once fhir client is authorized then the following functions can be executed
FHIR.oauth2.ready().then(function(client) {

  // get patient object and then display its demographics info in the banner
  client.request(`Patient/${client.patient.id}`).then(
    function(patient) {
      displayPatient(patient);
      console.log(patient);
	  document.getElementById('predict').addEventListener("click", function () {
		var smokingScore = smokingCal();
		var prob = copdPredict(genderCal(patient), ageCal(patient), smokingScore);
		positivePred = "The Patient is predicted having COPD";
		negativePred = "The Patient is predicted not having COPD";
		console.log(prob);
		if (prob > 0.6) {
			document.getElementById('result').innerHTML = positivePred;
		}
		else if (prob <= 0.6) {
			document.getElementById('result').innerHTML = negativePred;
		}
		})
    }
  );

  // get observation resoruce values
  // you will need to update the below to retrive the weight and height values
  var query = new URLSearchParams();

  query.set("patient", client.patient.id);
  query.set("_count", 100);
  query.set("_sort", "-date");
  query.set("code", [
    'http://loinc.org|8462-4',
    'http://loinc.org|8480-6',
    'http://loinc.org|2085-9',
    'http://loinc.org|2089-1',
    'http://loinc.org|55284-4',
    'http://loinc.org|3141-9',
	'http://loinc.org|8302-2',   //height
    'http://loinc.org|29463-7',  //weight
  ].join(","));

  client.request("Observation?" + query, {
    pageLimit: 0,
    flat: true
  }).then(
    function(ob) {

      // group all of the observation resoruces by type into their own
      var byCodes = client.byCodes(ob, 'code');
      var systolicbp = getBloodPressureValue(byCodes('55284-4'), '8480-6');
      var diastolicbp = getBloodPressureValue(byCodes('55284-4'), '8462-4');
      var hdl = byCodes('2085-9');
      var ldl = byCodes('2089-1');
	  var height = byCodes('8302-2');   //height
	  var weight = byCodes('29463-7');  //weight

      // create patient object
      var p = defaultPatient();

      // set patient value parameters to the data pulled from the observation resoruce
      if (typeof systolicbp != 'undefined') {
        p.sys = systolicbp;
      } else {
        p.sys = 'undefined'
      }

      if (typeof diastolicbp != 'undefined') {
        p.dia = diastolicbp;
      } else {
        p.dia = 'undefined'
      }

      p.hdl = getQuantityValueAndUnit(hdl[0]);
      p.ldl = getQuantityValueAndUnit(ldl[0]);
	  p.height = getQuantityValueAndUnit(height[0]); //get most recent observation
	  p.weight = getQuantityValueAndUnit(weight[0]);

      displayObservation(p)
	  console.log(p);

    });


  // dummy data for medrequests
  var medResults = ["SAMPLE Lasix 40mg","SAMPLE Naproxen sodium 220 MG Oral Tablet","SAMPLE Amoxicillin 250 MG"]

  // get medication request resources this will need to be updated
  // the goal is to pull all the medication requests and display it in the app. It can be both active and stopped medications
  
client.request("/MedicationRequest?patient=" + client.patient.id).then(function(result) {
//	console.log(result);
	return result['entry'];
}).then(function(entries) {
	entries.forEach(function(entry){
		var resource = entry['resource'];
		if (resource['status'] == "active" || resource['status'] == 'stopped')
			resource['medicationCodeableConcept']['coding'].forEach(
				function(med){
					displayMedication(med['display']);
				});
	});

//	console.log(entries);
});

}).catch(console.error);
