#loading two datasets: data_16s and metadata
#load("diabimmune_karelia_16s_data.rdata")
#load("DIABIMMUNE_Karelia_metadata.RData")

library(randomForest)
library(ROCR)
library(r)
library(rjson)

#Match metdata and data_16s
metadata <- metadata[ metadata$SampleID %in% rownames(data_16s), ]
data_16s <- data_16s[ metadata$SampleID, ]

 #Verify the match
all(rownames(data_16s) == metadata$SampleID)

 #Select rows for age > 170 && age < 260
metadata <- metadata[metadata[, "age_at_collection"] > 170,]
metadata <- metadata[metadata[, "age_at_collection"] < 260,]
data_16s <- data_16s[ metadata$SampleID, ]

#Select only genus level columns
df <- data_16s[ , grepl( "g__" , colnames( data_16s ) ) ]

#Select cohorts by country
metaRUS <- metadata[metadata[, "country"] == "RUS",]
metaEST <- metadata[metadata[, "country"] == "EST",]
metaFIN <- metadata[metadata[, "country"] == "FIN",]

#Create data frames for country pairs
metaRUSFIN <- rbind(metaRUS, metaFIN)
metaRUSEST <- rbind(metaRUS, metaEST)
metaESTFIN <- rbind(metaEST, metaFIN)

df.rf <- df[ metaRUSFIN$SampleID, ]
df.re <- df[ metaRUSEST$SampleID, ]
df.ef <- df[ metaESTFIN$SampleID, ]

#Create a response column for RUS-FIN data
country <- match(metaRUSFIN$country, unique(metaRUSFIN$country))
country <- factor(country)

# Write this data frame into file for JS
newdf.rf <- data.frame(df.rf)
colnames(newdf.rf) <- colnames(df.rf)
newdf.rf$country <- country
js <- toJSON(unname(split(newdf.rf, 1:nrow(newdf.rf))))
fname = paste('rdata/vatanen_dfrf.json',sep='')
write(js, fname)

perf.df <- data.frame(x=double(), y=double(), pid=integer())

#Call RF: (1) 
test.rf <- randomForest(df.rf, country, ntree= 25000, keep.forest = TRUE, importance = TRUE, proximity = TRUE)
rf.p <- classCenter(df.rf, country, test.rf$proximity)

# write prototypes to file
rf.pdf <- data.frame(rf.p)
colnames(rf.pdf) <- colnames(df.rf)
rf.pdf$country <- rownames(rf.pdf)
js <- toJSON(unname(split(rf.pdf, 1:nrow(rf.pdf))))
fname = paste('rdata/vatanen_prf.json',sep='')
write(js, fname)




rf_predict = predict(test.rf, newdata = df.rf , predict.all = TRUE, type="prob" )
#Take a look at confusion matrix
print(test.rf$confusion)
#Take some performance measures
pr = as.vector(test.rf$votes[,2])
pred = prediction(pr, country)
perf_ROC = performance(pred, "tpr", "fpr")
plot(perf_ROC, main="ROC Plot", colorize=TRUE)
perf_auc = performance(pred, measure="auc")
perf_auc@y.values
# prints ~0.94375
p_repeat <- rep(1, length(perf_ROC@x.values))
newperf.df <- data.frame(x=perf_ROC@x.values, y=perf_ROC@y.values, pid=p_repeat)
names(newperf.df)<- c("x","y","pid")
perf.df = rbind(perf.df, newperf.df)

print(perf.df)
js <- toJSON(unname(split(perf.df, 1:nrow(perf.df))))
fname = paste('rdata/roc_rf.json',sep='')
write(js, fname)


#Repeat for Russians versus Estonians
#Create a response column
country <- match(metaRUSEST$country, unique(metaRUSEST$country))
country <- factor(country)

# Write this data frame into file for JS
newdf.re <- data.frame(df.re)
colnames(newdf.re) <- colnames(df.re)
newdf.re$country <- country
js <- toJSON(unname(split(newdf.re, 1:nrow(newdf.re))))
fname = paste('rdata/vatanen_dfre.json',sep='')
write(js, fname)

#Call RF: (2) 
test.re <- randomForest(df.re, country, ntree= 25000, keep.forest = TRUE, importance = TRUE, proximity = TRUE)
re_predict = predict(test.re, newdata = df.re , predict.all = TRUE, type="prob" )
#Take a look at confusion matrix
print(test.re$confusion)
#Take some performance measures
pr2 = as.vector(test.re$votes[,2])
pred2 = prediction(pr2, country)
perf_ROC2 = performance(pred2, "tpr", "fpr")
plot(perf_ROC2, add=TRUE, colorize=TRUE)
perf_auc2 = performance(pred2, measure="auc")
perf_auc2@y.values
# prints ~0.9402632
p_repeat <- rep(2, length(perf_ROC2@x.values))
newperf.df <- data.frame(x=perf_ROC2@x.values, y=perf_ROC2@y.values, pid=p_repeat)
names(newperf.df)<- c("x","y","pid")
perf.df = rbind(perf.df, newperf.df)

#print(perf.df)
js <- toJSON(unname(split(newperf.df, 1:nrow(newperf.df))))
fname = paste('rdata/roc_re.json',sep='')
write(js, fname)

#Repeat for Estonians versus Finns
#Create a response column
country <- match(metaESTFIN$country, unique(metaESTFIN$country))
country <- factor(country)
# Write this data frame into file for JS
newdf.ef <- data.frame(df.ef)
colnames(newdf.ef) <- colnames(df.ef)
newdf.ef$country <- country
js <- toJSON(unname(split(newdf.ef, 1:nrow(newdf.ef))))
fname = paste('rdata/vatanen_dfef.json',sep='')
write(js, fname)

#Call RF: (3) 
test.ef <- randomForest(df.ef, country, ntree= 25000, keep.forest = TRUE, importance = TRUE, proximity = TRUE)
ef_predict = predict(test.ef, newdata = df.ef , predict.all = TRUE, type="prob" )
#Take a look at confusion matrix
print(test.ef$confusion)
#Take some performance measures
pr3 = as.vector(test.ef$votes[,2])
pred3 = prediction(pr3, country)
perf_ROC3 = performance(pred3, "tpr", "fpr")
plot(perf_ROC3, add=TRUE, colorize=TRUE)
perf_auc3 = performance(pred3, measure="auc")
perf_auc3@y.values
# prints  ~0.5355263
p_repeat <- rep(3, length(perf_ROC3@x.values))
newperf.df <- data.frame(x=perf_ROC3@x.values, y=perf_ROC3@y.values, pid=p_repeat)
names(newperf.df)<- c("x","y","pid")
perf.df = rbind(perf.df, newperf.df)

#print(perf.df)
js <- toJSON(unname(split(newperf.df, 1:nrow(newperf.df))))
fname = paste('rdata/roc_ef.json',sep='')
write(js, fname)

js <- toJSON(unname(split(perf.df, 1:nrow(perf.df))))
fname = paste('rdata/roc_all.json',sep='')
write(js, fname)

#Create data frames for importance
imp_rf <- data.frame(test.rf$importance)
imp_re <- data.frame(test.re$importance)
imp_ef <- data.frame(test.ef$importance)

# Merge them into 1 data frame
new.imp_rf <- data.frame(name= rownames(imp_rf), MDA= imp_rf$MeanDecreaseAccuracy, MDG=imp_rf$MeanDecreaseGini )
new.imp_re <- data.frame(name= rownames(imp_re), MDA= imp_re$MeanDecreaseAccuracy, MDG=imp_re$MeanDecreaseGini )
new.imp_ef <- data.frame(name= rownames(imp_ef), MDA= imp_ef$MeanDecreaseAccuracy, MDG=imp_ef$MeanDecreaseGini )
final <- data.frame(Reduce(function(...) merge(..., all=TRUE, by='name'), list(new.imp_rf, new.imp_re, new.imp_ef)))

#Rename columns of the importance data frame and write JSON file
colnames(final) <- c("name", "MDA_RF", "MDG_RF", "MDA_RE", "MDG_RE", "MDA_EF", "MDG_EF")
js <- toJSON(unname(split(final, 1:nrow(final))))
fname = paste('rdata/vatanen_imp.json',sep='')
write(js, fname)

# Confusion matrices
conf_rf <- data.frame(test.rf$confusion)
conf_re <- data.frame(test.re$confusion)
conf_ef <- data.frame(test.ef$confusion)

js <- toJSON(unname(split(conf_rf, 1:nrow(conf_rf))))
fname = paste('rdata/conf_rf.json', sep='')
write(js,fname)

js <- toJSON(unname(split(conf_ef, 1:nrow(conf_ef))))
fname = paste('rdata/conf_ef.json', sep='')
write(js,fname)

js <- toJSON(unname(split(conf_re, 1:nrow(conf_re))))
fname = paste('rdata/conf_re.json', sep='')
write(js,fname)