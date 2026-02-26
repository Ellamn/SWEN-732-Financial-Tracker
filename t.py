frmat = lambda bp, route, model, method: \
f'def test_{method}_{model}():\n' \
f'    result = {method}_rest_call(BASE)\n'\
 '    assert result[\'message\'] == \'Hello world!\''

specs = [
    'balance',
    'expenses',
    'goals',
    'income',
    'users'
]

for spec in specs:
    for method in ['get','put','post','delete']:
        print(frmat(spec,'/',spec,method))
        print('\n')
    print('='*40)