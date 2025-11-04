# PandaPostage Frontend Client - 2025


## Run & build
```
npm install
npm run dev

npm run build
```


## SHIPPING DEMO - TODO

- rates
    - delivery dates are only estimates
    - your price => Panda Price

- sidebar & banner
    - more layouts with debug toggles (compact vs full)

- label summary
    - estimated elivery date
    - package detail items too tight

- reciepts 
    - print after label option
    - print to zpl or pdf/img
    - verify accurate data
    - panda logo missing

- packages 
    - middle dimension field no rounding on corners

- add-on services & details
    - reference fields + print on label
    - all other services
    - filter by carrier + packageType?

- package types
    - predefine all package types? (ie: usps letter, ups express pak, parcel)
        - https://ship.pirateship.com/rates
        - modifying carrier will filter associated package types
        - modifying package type will auto-select carrier if applicable

- labels 
    - how are we going to configure & generate zpl labels
    - panda branded labels? zpl customization? Easypost,usps,ups terms?

- website frame
    - header, sidebar, mobile menu
    - debug toggle


## INFRASTRUCTURE - TODO

- page routing
    - verify apache/nginx will recognize react routes

- static cdn hosting
    - can we host the whole frontend in S3 or static host?
    - CORS api specific domains only
    - challenges? risks?

- client gateway vs monorepo?


## Architecture - TODO

### Monolith vs Gateway api
Do we need to build a separate gateway api to communicate with UnifiedShipping? Or should we just commit to modular monolith and break up later as needed? 

### Client->Monolith Flow
- Easy to extend (with discipline)
- Simple Deployment
- Simple Development
- Tight coupling
- Modules instead of services
- Same process - Must scale entire app
```
Client <=> Monolith <=> UnifiedShipping (module)
                    <=> Authentication (module)
                    <=> Payments (module)
                    <=> Ecommerce (module)
```

### Client->Gateway Microservice flow
- Easy to extend
- Moderate Deployment - Can deploy parts that are relevant.. but wrangling it all at once sucks
- Tedious Development - juggling multiple repos / projects
- Loose Coupling
- Services instead of modules
- Separate processes - can scale each as needed (granular control)
```
Client <=> Gateway <=> UnifiedShipping (service)
                   <=> Authentication (service)
                   <=> Payments (service)
                   <=> Ecommerce (service)
```

### Client -> Gateway -> Monolith flow
- Moderate to extend - (easier w/ shared models)
- Moderate Deployment - (Client,Gateway,Monolith all need to build)
- Moderate Development 
- Moderate Coupling
- Modules instead of services
- Single process + thin transform/gateway api
```
Client <=> Gateway <=> Monolith <=> UnifiedShipping (module)
                                <=> Authentication (module)
                                <=> Payments (module)
                                <=> Ecommerce (module)
```
