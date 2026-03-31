@ECHO OFF
echo Dropping DB dev
mongosh dev --eval "db.dropDatabase()"
for %%f in (seed\*.json) do (
  echo Seeding %%~nf from %%f in DB dev
  "C:\Program Files\MongoDB\Tools\bin\mongoimport.exe" --db=dev --collection=%%~nf --file=%%f --jsonArray
)
// line 6: mongoimport --db=dev --collection=%%~nf --file=%%f --jsonArray
