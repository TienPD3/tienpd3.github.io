var modifiedHeaders = $request.headers;
modifiedHeaders['X-Authorization'] = 's55HuQ_MP_OAWuvagOKCYA';
modifiedHeaders['X-Signature'] = '08dc6dd0828baa93971acb143c9dbb31406834c9c543a16b452c564c812dc621';

$done({headers : modifiedHeaders});