import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
#SKLEARN IMPORTS
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
#keras IMPORTS
from keras.models import Sequential#fro evey DL project for neural network you need a sequential model for layer stacking
from keras.layers import Dense,Dropout #for creating layers and dropout to avoid overfitting
from keras.callbacks import EarlyStopping #to stop training when model stops improving
from keras.utils import to_categorical #for one hot encoding

#data processing
data=pd.read_csv('data.csv')
X=data.drop('Class',axis=1)#it contains all the features for training except target column that is class
y=data['Class']#it contains target column

#train test split
X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.2,random_state=42)

#validation split/set
X_train,X_val,y_train,y_val=train_test_split(X_train,y_train,test_size=0.2,random_state=42)#Validation set → check performance during training

#scaling
scaler=StandardScaler()
X_train=scaler.fit_transform(X_train)
X_val=scaler.transform(X_val)
X_test=scaler.transform(X_test)

# X_train=X_train.values
# X_val=X_val.values
# X_test=X_test.values

# print(f'X_train shape: {X_train.shape}, y_train shape: {y_train.shape}')
# print(f'X_val shape:   {X_val.shape},   y_val shape:   {y_val.shape}')
# print(f'X_test shape:  {X_test.shape},  y_test shape:  {y_test.shape}')


#Build the ANN model
#Define the Model
model=Sequential([
    Dense(64 , activation='relu', input_shape=(X_train.shape[1],)),#INPUT LAYER
    Dropout(0.3),    #if i want to drop 30% neurons to drop after every layer to reduce overfitting
    Dense(32 , activation='relu'),#Hidden Layer-1
    Dropout(0.3),
    Dense(16 , activation='relu'),#Hidden Layer-2
    Dense(1,activation='sigmoid')#Output layer if it is binary clas classification problem use 1 or 2 neuron  use sigmoid if ussing 1 but if using more than one use softmax
])

model.compile(optimizer='adam',loss='binary_crossentropy',metrics=['accuracy'])#backpropogation,model update weights base on learning rate

earlyStopping=EarlyStopping(
    monitor='val_loss',
    patience=5,#if model is not reducing valiation loss so stop
    restore_best_weights=True   
)
model.summary()

#Train the Model
history=model.fit(
    X_train,y_train,
    validation_data=(X_val,y_val),
    epochs=15,
    batch_size=12,
    callbacks=[earlyStopping]
)

#Evaluate the Model
model.evaluate(X_test,y_test)

y_pred=(model.predict(X_test)>0.5).astype(int)
print(classification_report(y_test,y_pred))

cm=confusion_matrix(y_test,y_pred)
plt.figure(figsize=(6,4))
sns.heatmap(cm,annot=True,fmt='d',cmap='Blues',xticklabels=['Fake','Real'],yticklabels=['Fake','Real'])
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
plt.show()

#Prediction
#Example input data for prediction (replace with actual values)
# input_data=np.array([[1.5,2.3,3.4,0.7]])
input_data=np.array([[-3.0,1.2,0.5,2.1]])

def make_prediction(input):
    input_data_scaled=scaler.transform(input_data)#scale the input data
    predictions=model.predict(input_data_scaled)
    predicted_class=(predictions>0.5).astype(int)
    if predicted_class[0]==1:
        return 'Real Note'
    else:
        return "Fake Note"
        

#Get the prediction
result=make_prediction(input_data)
print(result)


#Save the model
model.save('models/Bank_Note_Prediction_Model.h5')
#Save the scaler using pickle
with open('models/scaler.pkl','wb') as scaler_file:
    pickle.dump(scaler,scaler_file)
