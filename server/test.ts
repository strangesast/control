/*
describe('users', () => {
  const defaultParams = { credentials: 'same-origin', headers: new Headers({ 'Content-Type': 'application/json' }) };
  const userParams = { username: 'toast', password: 'toasttoasttoasdt' };

  async function send(path, params={}, qp={}) {
    let queryString = Object.keys(qp).map(k => [k, qp[k]].map(encodeURIComponent).join('=')).join('&');
    if (queryString) path += ('?' + queryString);
    let req = new Request(path, Object.assign({}, defaultParams, params));
    let res = await fetch(req);
    if (res.status < 200 || res.status >= 400) {
      let error;
      try {
        error = await res.json();
      } catch (err) {}
      console.error(error)
      throw new Error(error ? error.message : `request failed (${ res.status })`);
    }
    return res;
  }

  it('should create user', test(async() => {
    let res = await send('/register', { method: 'POST', body: JSON.stringify(userParams) });

    expect(res.status >= 200 && res.status < 400).toBeTruthy('invalid response code');
  }));

  it('should delete user', test(async() => {
    let res = await send('/unregister', { method: 'DELETE' });
    expect(res.status).toBe(200, 'invalid response code');
  }));

  describe('user actions', () => {
    let currentUserId;
    beforeEach(test(async() => {
      let res = await send('/register', { method: 'POST', body: JSON.stringify(userParams) });
      ({ _id: currentUserId } = await res.json());
    }));

    afterEach(test(async() => {
      let res = await send('/unregister', { method: 'DELETE' });
      expect(res.status).toBe(200, 'invalid response code');
    }));

    it('should get/set the current user template', test(async() => {
      let res = await send('/user/template');

      // should be an empty template
      let template = await res.json();
      expect(Object.keys(template).length).toBe(0);

      template = { components: [], values: [] };
      res = await send('/user/template', { method: 'POST', body: JSON.stringify(template) });

      res = await send('/user/template');
      let _template = await res.json();
      expect(_template).toEqual(template);
    }));

    describe('application / group management', () => {
      let applicationIds;
      let groupIds;

      it ('should create a few example groups & applications', test(async() => {
        let res = await send('/applications');
        let template = await res.json();
        expect(template).toEqual([]);

        let applications = Array.from(Array(10)).map((_, i) => ({
          name: `Application ${ i+1 }`
        }));
        res = await send('/applications', { method: 'POST', body: JSON.stringify(applications) });
        applicationIds = await res.json();

        let groups = Array.from(Array(3)).map((_, i) => ({
          name: `Group ${i+1}`,
          description: `Groupppppppppppp ${ i+1 }`,
          applications: applications.reduce((acc, _, j) => (j % 3) == i ? acc.concat(applicationIds[j]) : acc, [])
        }));

        res = await send('/groups', { method: 'POST', body: JSON.stringify(groups) })
        groupIds = await res.json();
      }));

      it ('should add a few applications to a user', test(async() => {

        let res = await send('/users');
        let users = await res.json();
        expect(users.length).toBeGreaterThan(0);

        let asubset = applicationIds.slice(0, 1);
        let gsubset = groupIds.slice(0, 2);
        res = await send(`/users/${ currentUserId }`, { method: 'PUT', body: JSON.stringify({ applications: asubset, groups: gsubset }) });

        res = await send(`/users/${ currentUserId }`);
        expect(await res.text()).toEqual(JSON.stringify(Object.assign({}, users[0], { applications: asubset, groups: gsubset })));

        res = await send(`/users/${ currentUserId }/applications`);
        let a1 = await res.json();

        res = await send(`/user/applications`);
        let a2 = await res.json();

        expect(a1).toEqual(a2);

        await send('/applications', { method: 'DELETE' });
        await send('/groups', { method: 'DELETE' });
      }));

      //for (let group of groups) {
      //  await send('/groups', { method: 'POST', body: JSON.stringify(group) });
      //}

    });
  })
});

function test(run) {
  return (done) => {
    run().then(
      done,
      e => {
        done.fail(e);
        done();
      }
    );
  };
}
?*/
