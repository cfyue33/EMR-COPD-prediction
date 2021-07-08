# Regression Modeling for COPD Diagnosis and Its Use in A SMART-on-FHIR App


**Abstract**— Early diagnosis is a key challenge for the timely intervention and management of Chronic Obstructive Pulmonary Disease (COPD), a life-threatening lung disease in the US. Here in this work a highly accurate (F1 score being 0.95) classification model 
was built using regression modeling. Based on basic information of a specific patient including gender, age, and smoking status, 
the model predicts if the patient is likely having COPD or not. A SMART-on-FHIR app was built to demonstrate the use of this predictive model in a clinical setting. 

## 1 PROBLEM STATEMENT

Chronic Obstructive Pulmonary Disease (COPD), a non-curable and progressively worsening lung disease, has been one of the leading causes of death in US (CDC, 2015) and worldwide. Currently, COPD is diagnosed by a lung function test called spirometry, which measures how deeply a person can breathe and how fast air can move into and out of the lungs (WHO, n.d.). A review study found that the spirometry test has a pooled sensitivity of 79.9% and specificity of 84.4% (Haroon et al, 2015). 

The limited availability of spirometers in underdeveloped regions, the sub-optimal testing accuracy of spirometry, and the fact that today many patients having COPD may not be diagnosed until the disease is advanced (Mayo Cinic, 2020) call for a more convenient, lower-cost test with equal or higher accuracy for the diagnosis of COPD. With known risk factors on COPD, machine learning (ML) can potentially help solve these challenges by building a predictive tool for the accurate diagnosis of COPD.

## 2 APPROACH

### 2.1 Dataset 
Comprehensive data that can be used for ML studies on COPD had been limited until the recent work by Zarrin et al (Zarrin, Roeckendorf, & Wenger, 2020). In the study that compared a number of ML tools, demographic information was collected from 239 subjects who is either a COPD patient and healthy control. Out of these 239 subjects, saliva samples were collected from 80 subjects and permittivity measurements were conducted on the saliva – data were reported as the minimum and avg values of the imaginary and real parts. The dataset also contains the demographic information of 160 patients diagnosed with asthma or respiratory infections, which are out of the scope of this study. Here is the link to download the entire dataset: https://archive.ics.uci.edu/ml/datasets/Exasens. 

### 2.2 Model
Given the binary type of problem statement the work intends to address, classification model was chosen for the study. 

### 2.3 Algorithm(s) & Libraries
There are a number of ML algorithms that can do classification. Given the relatively small size of the dataset and the small number of features, generalized linear modeling (GLM) was chosen as the algorithm. R was chosen as the programming language, and some corresponding functions for GLM, such as lm and glm, are included in standard R package (no external library needed). 

## 3 ANALYSIS
Refer to the Jupyter Notebook for code, output, and markdown comments: https://github.gatech.edu/cyue33/MP4/blob/master/MP4_cyue33.ipynb3

## 4 OUTCOME
### 4.1 Final ML model
As detail in the attached pdf of the Jupyter notebook, multiple lm and glm fittings were compared – the best model that was chosen as the final ML model has a high F1 score (Harikrishnan, 2019) of 0.95 and only uses demographic information including gender, age, and smoking status for predicting whether a subject likely has COPD or not. Below is the closed form model: 

**Probability = -0.719518 + 0.099568 * Gender + 0.017798 * Age + 0.065001 * Smoking, where:
Gender = "1" for males and "0" for females,
Smoking = "1" for non-smokers, "2" for ex-smokers, and "3" for active smokers, 
and use 0.6 as the threshold probability value, i.e., if probability > 0.6, the subject is predicted to have COPD, otherwise, non-COPD.**

### 4.2 SMART-on-FHIR app
Using only gender, age, and smoking status as input, the predictive model can have many useful applications in both clinical and non-clinical settings. Here in this work a SMART-on-FHIR app is built incorporating the final model. It could be a very useful tool for health providers such as primary doctors to have as part of their toolset for preventive care of patients. Specifically, the app has a section called “COPD Prediction”, where the doctor can input a choice for the smoking status of the patient, which can be obtained for example during consultation with the patient or patient survey. Upon clicking the “Predict” button, the app in the background 
will calculate the probability based on the final ML model, using patient gender and age that are extracted from patient profile and smoking status input by the provider. The app will compare the calculated probability with the threshold 
probability (0.6) and show the conclusion on the screen: “The patient is predicted having COPD” or “The patient is predicted not having COPD”. If a patient is predicted having COPD, actions can follow such as conversations with patients on possible symptoms and a spirometry test can be ordered to confirm the prediction.

The launcher URL of the app is:
https://launch.smarthealthit.org/?auth_error=&fhir_version_1=r4&fhir_version_2=r4&iss=&launch_ehr=1&launch_url=https%3A%2F%2Fgithub.gatech.edu%2Fpages%2Fcyue33%2FMP4%2Flaunch.html&patient=&prov_skip_auth=1&provider=&pt_skip_auth=1&public_key=&sb=&sde=&sim_ehr=0&token_lifetime=15&user_pt=

## 5 REFERENCES
1. Centers for Disease Control and Prevention (CDC). (2015). Deaths, percent of total deaths, and death rates for the 15 leading causes of death in 10-year age groups, by race and sex: United States, 2015. Retrieved from https://www.cdc.gov/nchs/data/dvs/LCWK2_2015.pdf
2. Harikrishnan, N.B. (2019). Confusion Matrix, Accuracy, Precision, Recall, and F1 
Score. Retrieved from https://medium.com/analytics-vidhya/confusion-matrix-accuracy-precision-recall-f1-score-ade299cf63cd
3. Haroon, S., Jordan, R., Takwoingi, Y., & Adab P. (2015). Diagnostic Accuracy of Screening Tests for COPD: A Systematic Review and Meta-analysis. BMJ Open, 5(10):e008133.
4. Mayo Clinic. (2020). COPD. Retrieved from https://www.mayoclinic.org/diseases-conditions/copd/diagnosis-treatment/drc-20353685
5. World Health Organization (WHO). Diagnosis of COPD. Retrieved from 
https://www.who.int/respiratory/copd/diagnosis/en/#:~:text=of%20your%20lungs.-,Spirometry,and%20out%20of%20the%20lungs.
6. Zarrin, P.S., Roeckendorf, N., and Wenger, C. (2020). In-vitro Classification of Saliva Samples of COPD Patients and Healthy Controls Using Non-perceptron Machine Learning Tools. Annals of biomedical engineering, 8, 168053 – 168060.
