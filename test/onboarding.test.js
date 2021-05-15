const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

let server = "../app";

let onbObject = {
	"email": "abhinav20016@gmail.com"
}

describe("Onboading", () => {
	describe("/PATCH /onboard/", (done) => {
		chai.request(server)
		.patch('/onboard/')
		.set('content-type', 'application/json')
		.send(onbObject)
		.end((err, res) => {
			console.log(res);
			//expect(res).to.have.status(200);
			//(res.body).should.be.a('object');
			//(res.body.onboarding).should.be.eql(true);

		});
	});
});
